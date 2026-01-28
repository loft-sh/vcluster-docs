/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureTable from '../index';

// Mock the YAML data files with 4-tier structure (Free, Dev, Prod, Scale)
jest.mock('@site/src/data/features.yaml', () => ({
  features: {
    'test-feature-free': {
      name: 'Test Free Feature',
      description: 'A feature available in Free tier',
      category: 'Core',
      docs_url: '/docs/test-free',
    },
    'test-feature-dev': {
      name: 'Test Dev Feature',
      description: 'A feature starting from Dev tier',
      category: 'Operations',
      docs_url: '/docs/test-dev',
    },
    'test-feature-scale': {
      name: 'Test Scale Feature',
      description: 'A feature only in Scale tier',
      category: 'Security',
      docs_url: '/docs/test-scale',
    },
    'test-feature-no-url': {
      name: 'Feature Without URL',
      description: 'A feature without documentation URL',
      category: 'Testing',
    },
  },
}));

jest.mock('@site/src/data/products.yaml', () => ({
  products: {
    free: {
      name: 'Free',
      enterprise: false,
      features: ['test-feature-free', 'test-feature-no-url'],
    },
    dev: {
      name: 'Dev',
      enterprise: true,
      features: ['test-feature-free', 'test-feature-dev', 'test-feature-no-url'],
    },
    prod: {
      name: 'Prod',
      enterprise: true,
      features: ['test-feature-free', 'test-feature-dev', 'test-feature-no-url'],
    },
    scale: {
      name: 'Scale',
      enterprise: true,
      features: ['test-feature-free', 'test-feature-dev', 'test-feature-scale', 'test-feature-no-url'],
    },
  },
}));

describe('FeatureTable Component', () => {
  // Suppress console warnings for cleaner test output
  const originalWarn = console.warn;
  beforeAll(() => {
    console.warn = jest.fn();
  });
  afterAll(() => {
    console.warn = originalWarn;
  });

  describe('Basic Rendering', () => {
    test('renders table with feature data', () => {
      render(<FeatureTable names="test-feature-free" />);

      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
    });

    test('renders table headers correctly with 4 tiers', () => {
      render(<FeatureTable names="test-feature-free" />);

      expect(screen.getByText('Feature')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Dev')).toBeInTheDocument();
      expect(screen.getByText('Prod')).toBeInTheDocument();
      expect(screen.getByText('Scale')).toBeInTheDocument();
    });

    test('renders Enterprise header by default', () => {
      render(<FeatureTable names="test-feature-free" />);

      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    test('hides Enterprise header when showEnterpriseHeader is false', () => {
      render(<FeatureTable names="test-feature-free" showEnterpriseHeader={false} />);

      expect(screen.queryByText('Enterprise')).not.toBeInTheDocument();
    });

    test('renders multiple features', () => {
      render(<FeatureTable names="test-feature-free,test-feature-dev" />);

      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
    });
  });

  describe('Feature Links', () => {
    test('renders feature name as link when docs_url is present', () => {
      render(<FeatureTable names="test-feature-free" />);

      const link = screen.getByRole('link', { name: 'Test Free Feature' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/test-free');
    });

    test('renders feature name as text when docs_url is missing', () => {
      render(<FeatureTable names="test-feature-no-url" />);

      const text = screen.getByText('Feature Without URL');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('SPAN');
    });
  });

  describe('Product Availability', () => {
    test('shows Free feature as available in all tiers', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);

      const checkmarks = container.querySelectorAll('[title*="Available in"]');
      expect(checkmarks).toHaveLength(4); // Free, Dev, Prod, Scale
    });

    test('shows Dev feature as unavailable in Free, available in others', () => {
      const { container } = render(<FeatureTable names="test-feature-dev" />);

      const freeNotAvailable = container.querySelector('[title="Not available in Free"]');
      const devAvailable = container.querySelector('[title="Available in Dev"]');
      const prodAvailable = container.querySelector('[title="Available in Prod"]');
      const scaleAvailable = container.querySelector('[title="Available in Scale"]');

      expect(freeNotAvailable).toBeInTheDocument();
      expect(devAvailable).toBeInTheDocument();
      expect(prodAvailable).toBeInTheDocument();
      expect(scaleAvailable).toBeInTheDocument();
    });

    test('shows Scale feature as only available in Scale', () => {
      const { container } = render(<FeatureTable names="test-feature-scale" />);

      const freeNotAvailable = container.querySelector('[title="Not available in Free"]');
      const devNotAvailable = container.querySelector('[title="Not available in Dev"]');
      const prodNotAvailable = container.querySelector('[title="Not available in Prod"]');
      const scaleAvailable = container.querySelector('[title="Available in Scale"]');

      expect(freeNotAvailable).toBeInTheDocument();
      expect(devNotAvailable).toBeInTheDocument();
      expect(prodNotAvailable).toBeInTheDocument();
      expect(scaleAvailable).toBeInTheDocument();
    });

    test('displays checkmarks and crosses correctly', () => {
      const { container } = render(<FeatureTable names="test-feature-dev" />);

      const crosses = container.querySelectorAll('span.cross');
      const checkmarks = container.querySelectorAll('span.checkmark');

      expect(crosses.length).toBeGreaterThan(0);
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('shows all features when no names provided', () => {
      render(<FeatureTable names="" />);
      // Should show all 4 mock features
      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Scale Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('shows all features when names prop is missing', () => {
      render(<FeatureTable />);
      // Should show all 4 mock features
      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Scale Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('shows all features when names="all"', () => {
      render(<FeatureTable names="all" />);
      // Should show all 4 mock features
      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Scale Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('handles whitespace in feature names', () => {
      render(<FeatureTable names="  test-feature-free  ,  test-feature-dev  " />);

      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
    });

    test('filters out empty strings from feature names', () => {
      render(<FeatureTable names="test-feature-free,,test-feature-dev" />);

      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Dev Feature')).toBeInTheDocument();
    });

    test('warns and skips invalid feature IDs', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<FeatureTable names="invalid-feature-id,test-feature-free" />);

      expect(warnSpy).toHaveBeenCalledWith(
        'FeatureTable: Feature "invalid-feature-id" not found in features.yaml'
      );
      expect(screen.getByText('Test Free Feature')).toBeInTheDocument();

      warnSpy.mockRestore();
    });

    test('returns null when all features are invalid', () => {
      const { container } = render(<FeatureTable names="invalid1,invalid2" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('CSS Classes', () => {
    test('applies correct wrapper class', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);
      expect(container.querySelector('.featureTableWrapper')).toBeInTheDocument();
    });

    test('applies correct table class', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);
      expect(container.querySelector('.featureTable')).toBeInTheDocument();
    });

    test('applies centerAlign class to tier columns', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);
      const centerAlignCells = container.querySelectorAll('.centerAlign');

      // Should have centerAlign on 4 tier header cells plus 4 data cells = 8 total
      expect(centerAlignCells.length).toBeGreaterThanOrEqual(8);
    });

    test('applies enterpriseHeader class to Enterprise header', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);
      expect(container.querySelector('.enterpriseHeader')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('table has proper semantic structure', () => {
      render(<FeatureTable names="test-feature-free" />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole('columnheader');
      // Feature + 4 tiers = 5 (plus Enterprise header row has 3 cells)
      expect(columnHeaders.length).toBeGreaterThanOrEqual(5);
    });

    test('checkmarks and crosses have title attributes for accessibility', () => {
      const { container } = render(<FeatureTable names="test-feature-free" />);

      const availableFree = container.querySelector('[title="Available in Free"]');
      const availableDev = container.querySelector('[title="Available in Dev"]');

      expect(availableFree).toBeInTheDocument();
      expect(availableDev).toBeInTheDocument();
    });
  });

  describe('Heading', () => {
    test('displays default heading', () => {
      render(<FeatureTable names="test-feature-free" />);
      expect(screen.getByText('Feature availability:')).toBeInTheDocument();
    });
  });

  describe('Alphabetical Sorting', () => {
    test('sorts features alphabetically by name', () => {
      const { container } = render(<FeatureTable names="all" />);

      const rows = container.querySelectorAll('tbody tr');
      const featureNames = Array.from(rows).map(row =>
        row.querySelector('.featureName').textContent
      );

      // Should be alphabetically sorted
      const sortedNames = [...featureNames].sort((a, b) => a.localeCompare(b));
      expect(featureNames).toEqual(sortedNames);
    });
  });
});
