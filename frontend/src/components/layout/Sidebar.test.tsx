import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';

import Sidebar from './Sidebar';

describe('Sidebar', () => {
  let onCloseStub: sinon.SinonStub;

  const theme = createTheme();

  const setDesktopViewport = (isDesktop: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: sinon.stub().callsFake((query: string) => ({
        matches: isDesktop,
        media: query,
        onchange: null,
        addListener: sinon.stub(),
        removeListener: sinon.stub(),
        addEventListener: sinon.stub(),
        removeEventListener: sinon.stub(),
        dispatchEvent: sinon.stub(),
      })),
    });
  };

  const renderSidebar = ({
    mobileOpen = false,
    isDesktop = true,
    initialRoute = '/',
  }: {
    mobileOpen?: boolean;
    isDesktop?: boolean;
    initialRoute?: string;
  } = {}) => {
    setDesktopViewport(isDesktop);

    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Sidebar mobileOpen={mobileOpen} onClose={onCloseStub} />
        </MemoryRouter>
      </ThemeProvider>,
    );
  };

  beforeEach(() => {
    onCloseStub = sinon.stub();
  });

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  describe('branding and navigation', () => {
    it('should display the ACME branding and footer', () => {
      renderSidebar();

      expect(screen.getByText('ACME')).to.exist;
      expect(screen.getByText('People Management')).to.exist;
      expect(screen.getByText('WORKSPACE')).to.exist;
      expect(screen.getByText('ACME HR Management')).to.exist;
    });

    it('should display all navigation items with their correct routes', () => {
      renderSidebar();

      const employeesLink = screen.getByRole('link', { name: /employees/i });
      const salaryManagementLink = screen.getByRole('link', {
        name: /salary management/i,
      });

      expect(employeesLink.getAttribute('href')).to.equal('/employees');
      expect(salaryManagementLink.getAttribute('href')).to.equal('/salary-management');
    });

    it('should mark the Employees navigation item as active on the employees route', () => {
      renderSidebar({ initialRoute: '/employees' });

      const employeesLink = screen.getByRole('link', { name: /employees/i });

      expect(employeesLink.classList.contains('active')).to.equal(true);
    });

    it('should mark the Salary Management navigation item as active on its route', () => {
      renderSidebar({ initialRoute: '/salary-management' });

      const salaryManagementLink = screen.getByRole('link', {
        name: /salary management/i,
      });

      expect(salaryManagementLink.classList.contains('active')).to.equal(true);
    });
  });

  describe('navigation behavior', () => {
    it('should call onClose when the Employees navigation item is clicked', async () => {
      const user = userEvent.setup();

      renderSidebar({ isDesktop: false, mobileOpen: true });

      await user.click(screen.getByRole('link', { name: /employees/i }));

      expect(onCloseStub.calledOnce).to.equal(true);
    });

    it('should call onClose when the Salary Management navigation item is clicked', async () => {
      const user = userEvent.setup();

      renderSidebar({ isDesktop: false, mobileOpen: true });

      await user.click(screen.getByRole('link', { name: /salary management/i }));

      expect(onCloseStub.calledOnce).to.equal(true);
    });
  });

  describe('responsive behavior', () => {
    it('should render a permanent drawer on desktop', () => {
      const { container } = renderSidebar({
        isDesktop: true,
        mobileOpen: false,
      });

      expect(container.querySelector('.MuiDrawer-docked')).to.exist;
    });

    it('should render a temporary drawer on mobile', () => {
      renderSidebar({
        isDesktop: false,
        mobileOpen: true,
      });

      expect(document.body.querySelector('.MuiDrawer-modal')).to.exist;
    });

    it('should keep the mobile drawer closed when mobileOpen is false', () => {
      renderSidebar({
        isDesktop: false,
        mobileOpen: false,
      });

      expect(screen.queryByRole('link', { name: /employees/i })).to.equal(null);
    });

    it('should display the mobile drawer when mobileOpen is true', () => {
      renderSidebar({
        isDesktop: false,
        mobileOpen: true,
      });

      expect(screen.getByRole('link', { name: /employees/i })).to.exist;
    });
  });
});
