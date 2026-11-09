import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import MainLayout from './MainLayout';

describe('MainLayout', () => {
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

  const renderMainLayout = (isDesktop = true) => {
    setDesktopViewport(isDesktop);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MainLayout />,
          children: [
            {
              path: 'employees',
              element: <div>Employees Page Content</div>,
              handle: { title: 'Employees' },
            },
          ],
        },
      ],
      {
        initialEntries: ['/employees'],
      },
    );

    return render(
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>,
    );
  };

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  describe('layout rendering', () => {
    it('should render the sidebar and header', () => {
      renderMainLayout();

      expect(screen.getByText('ACME')).to.exist;
      expect(screen.getByText('HR Manager')).to.exist;
    });

    it('should render the current page through Outlet', () => {
      renderMainLayout();

      expect(screen.getByText('Employees Page Content')).to.exist;
    });

    it('should display the page title from the current route', () => {
      renderMainLayout();

      expect(within(screen.getByRole('banner')).getByText('Employees')).to.exist;
    });
  });

  describe('mobile sidebar behavior', () => {
    it('should keep the mobile sidebar closed initially', () => {
      renderMainLayout(false);

      expect(screen.queryByRole('link', { name: /employees/i })).to.equal(null);
    });

    it('should open the mobile sidebar when the header menu button is clicked', async () => {
      const user = userEvent.setup();

      renderMainLayout(false);

      await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));

      expect(await screen.findByRole('link', { name: /employees/i })).to.exist;
    });

    it('should close the mobile sidebar when a navigation item is clicked', async () => {
      const user = userEvent.setup();

      renderMainLayout(false);

      await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));

      const employeesLink = await screen.findByRole('link', {
        name: /employees/i,
      });

      await user.click(employeesLink);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /employees/i })).to.equal(null);
      });
    });
  });

  describe('desktop behavior', () => {
    it('should render the sidebar permanently on desktop', () => {
      const { container } = renderMainLayout(true);

      expect(container.querySelector('.MuiDrawer-docked')).to.exist;
    });

    it('should not display the mobile menu button on desktop', () => {
      renderMainLayout(true);

      expect(
        screen.queryByRole('button', {
          name: 'Open navigation menu',
        }),
      ).to.equal(null);
    });
  });
});
