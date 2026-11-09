import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import Header from './Header';

describe('Header', () => {
  let onMenuClickStub: sinon.SinonStub;

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

  const renderHeader = ({
    isDesktop = true,
    routes = [
      {
        path: '/',
        element: <div>Home</div>,
        handle: { title: 'Dashboard' },
      },
      {
        path: 'employees',
        element: <div>Employees Page</div>,
        handle: { title: 'Employees' },
      },
    ],
    initialRoute = '/employees',
  }: {
    isDesktop?: boolean;
    routes?: Array<{
      path: string;
      element: React.ReactNode;
      handle?: { title?: string };
      children?: Array<{
        path: string;
        element: React.ReactNode;
        handle?: { title?: string };
      }>;
    }>;
    initialRoute?: string;
  } = {}) => {
    setDesktopViewport(isDesktop);

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <ThemeProvider theme={theme}>
              <Header onMenuClick={onMenuClickStub} />
            </ThemeProvider>
          ),
          children: routes,
        },
      ],
      {
        initialEntries: [initialRoute],
      },
    );

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    onMenuClickStub = sinon.stub();
  });

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  describe('header rendering', () => {
    it('should display the HR Manager details', () => {
      renderHeader();

      expect(screen.getByText('HR Manager')).to.exist;
      expect(screen.getByText('Administrator')).to.exist;
    });

    it('should display the workspace branding', () => {
      renderHeader();

      expect(screen.getByText('ACME / Workspace')).to.exist;
    });

    it('should display the title from the current route', () => {
      renderHeader();

      expect(screen.getByText('Employees')).to.exist;
    });

    it('should display Workspace when no matched route has a title', () => {
      renderHeader({
        routes: [
          {
            path: 'employees',
            element: <div>Employees Page</div>,
          },
        ],
      });

      expect(screen.getByText('Workspace')).to.exist;
    });

    it('should display the deepest matched route title', () => {
      renderHeader({
        routes: [
          {
            path: 'employees',
            element: <div>Employees Page</div>,
            handle: { title: 'Employees' },
            children: [
              {
                path: ':employeeId',
                element: <div>Employee Details</div>,
                handle: { title: 'Employee Details' },
              },
            ],
          },
        ],
        initialRoute: '/employees/1',
      });

      expect(screen.getByText('Employee Details')).to.exist;
    });
  });

  describe('responsive behavior', () => {
    it('should display the menu button on mobile', () => {
      renderHeader({ isDesktop: false });

      expect(
        screen.getByRole('button', {
          name: 'Open navigation menu',
        }),
      ).to.exist;
    });

    it('should not display the menu button on desktop', () => {
      renderHeader({ isDesktop: true });

      expect(
        screen.queryByRole('button', {
          name: 'Open navigation menu',
        }),
      ).to.equal(null);
    });
  });

  describe('menu interaction', () => {
    it('should call onMenuClick when the menu button is clicked', async () => {
      const user = userEvent.setup();

      renderHeader({ isDesktop: false });

      await user.click(
        screen.getByRole('button', {
          name: 'Open navigation menu',
        }),
      );

      expect(onMenuClickStub.calledOnce).to.equal(true);
    });
  });
});
