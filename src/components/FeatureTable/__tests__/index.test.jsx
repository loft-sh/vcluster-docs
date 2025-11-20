/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureTable from '../index';

// Mock the YAML data files
jest.mock('@site/src/data/features.yaml', () => ({
  features: {
    'test-feature-oss': {
      name: 'Test OSS Feature',
      description: 'An open source feature for testing',
      category: 'Core',
      docs_url: '/docs/test-oss',
      enterprise_only: false,
      feature_type: 'oss',
      tenancy: {
        models: ['shared', 'private', 'standalone'],
      },
    },
    'test-feature-enterprise': {
      name: 'Test Enterprise Feature',
      description: 'An enterprise-only feature for testing',
      category: 'Security',
      docs_url: '/docs/test-enterprise',
      enterprise_only: true,
      feature_type: 'paid',
      tenancy: {
        models: ['shared'],
      },
    },
    'test-feature-no-url': {
      name: 'Feature Without URL',
      description: 'A feature without documentation URL',
      category: 'Testing',
      enterprise_only: false,
      feature_type: 'free',
      tenancy: {
        models: ['shared', 'private'],
      },
    },
  },
}));

jest.mock('@site/src/data/products.yaml', () => ({
  products: {
    oss: {
      name: 'vCluster OSS',
      features: ['test-feature-oss'],
    },
    enterprise: {
      name: 'vCluster Enterprise',
      features: ['test-feature-enterprise'],
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
      render(<FeatureTable names="test-feature-oss" />);

      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('An open source feature for testing')).toBeInTheDocument();
    });

    test('renders table headers correctly', () => {
      render(<FeatureTable names="test-feature-oss" />);

      expect(screen.getByText('Feature')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('OSS')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    test('renders multiple features', () => {
      render(<FeatureTable names="test-feature-oss,test-feature-enterprise" />);

      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
    });
  });

  describe('Feature Links', () => {
    test('renders feature name as link when docs_url is present', () => {
      render(<FeatureTable names="test-feature-oss" />);

      const link = screen.getByRole('link', { name: 'Test OSS Feature' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/docs/test-oss');
    });

    test('renders feature name as text when docs_url is missing', () => {
      render(<FeatureTable names="test-feature-no-url" />);

      const text = screen.getByText('Feature Without URL');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('SPAN');
    });
  });

  describe('Product Availability', () => {
    test('shows OSS feature as available in both OSS and Enterprise', () => {
      const { container } = render(<FeatureTable names="test-feature-oss" />);

      const checkmarks = container.querySelectorAll('[title="Available in OSS"], [title="Available in Enterprise"]');
      expect(checkmarks).toHaveLength(2);
    });

    test('shows Enterprise feature as only available in Enterprise', () => {
      const { container } = render(<FeatureTable names="test-feature-enterprise" />);

      const ossNotAvailable = container.querySelector('[title="Not available in OSS"]');
      const enterpriseAvailable = container.querySelector('[title="Available in Enterprise"]');

      expect(ossNotAvailable).toBeInTheDocument();
      expect(enterpriseAvailable).toBeInTheDocument();
    });

    test('displays checkmarks and crosses correctly', () => {
      const { container } = render(<FeatureTable names="test-feature-enterprise" />);

      const crosses = container.querySelectorAll('span.cross');
      const checkmarks = container.querySelectorAll('span.checkmark');

      expect(crosses.length).toBeGreaterThan(0);
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('shows all features when no names provided', () => {
      render(<FeatureTable names="" />);
      // Should show all 3 mock features
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('shows all features when names prop is missing', () => {
      render(<FeatureTable />);
      // Should show all 3 mock features
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('shows all features when names="all"', () => {
      render(<FeatureTable names="all" />);
      // Should show all 3 mock features
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('handles whitespace in feature names', () => {
      render(<FeatureTable names="  test-feature-oss  ,  test-feature-enterprise  " />);

      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
    });

    test('filters out empty strings from feature names', () => {
      render(<FeatureTable names="test-feature-oss,,test-feature-enterprise" />);

      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
    });

    test('warns and skips invalid feature IDs', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      render(<FeatureTable names="invalid-feature-id,test-feature-oss" />);

      expect(warnSpy).toHaveBeenCalledWith(
        'FeatureTable: Feature "invalid-feature-id" not found in features.yaml'
      );
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();

      warnSpy.mockRestore();
    });

    test('returns null when all features are invalid', () => {
      const { container } = render(<FeatureTable names="invalid1,invalid2" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('CSS Classes', () => {
    test('applies correct wrapper class', () => {
      const { container } = render(<FeatureTable names="test-feature-oss" />);
      expect(container.querySelector('.featureTableWrapper')).toBeInTheDocument();
    });

    test('applies correct table class', () => {
      const { container } = render(<FeatureTable names="test-feature-oss" />);
      expect(container.querySelector('.featureTable')).toBeInTheDocument();
    });

    test('applies centerAlign class to OSS and Enterprise columns', () => {
      const { container } = render(<FeatureTable names="test-feature-oss" />);
      const centerAlignCells = container.querySelectorAll('.centerAlign');

      // Should have centerAlign on OSS and Enterprise header cells (2) plus data cells (2) = 4 total
      expect(centerAlignCells.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Accessibility', () => {
    test('table has proper semantic structure', () => {
      render(<FeatureTable names="test-feature-oss" />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(4); // Feature, Description, OSS, Enterprise
    });

    test('checkmarks and crosses have title attributes for accessibility', () => {
      const { container } = render(<FeatureTable names="test-feature-oss" />);

      const availableOSS = container.querySelector('[title="Available in OSS"]');
      const availableEnterprise = container.querySelector('[title="Available in Enterprise"]');

      expect(availableOSS).toBeInTheDocument();
      expect(availableEnterprise).toBeInTheDocument();
    });
  });

  describe('Feature Type Badges', () => {
    test('displays OSS badge for OSS features', () => {
      render(<FeatureTable names="test-feature-oss" />);
      expect(screen.getByText('(OSS)')).toBeInTheDocument();
    });

    test('displays Paid badge for paid features', () => {
      render(<FeatureTable names="test-feature-enterprise" />);
      expect(screen.getByText('(Paid)')).toBeInTheDocument();
    });

    test('displays Free badge for free features', () => {
      render(<FeatureTable names="test-feature-no-url" />);
      expect(screen.getByText('(Free)')).toBeInTheDocument();
    });

    test('applies correct CSS classes to badges', () => {
      const { container } = render(<FeatureTable names="test-feature-oss,test-feature-enterprise,test-feature-no-url" />);

      expect(container.querySelector('.badgeOss')).toBeInTheDocument();
      expect(container.querySelector('.badgePaid')).toBeInTheDocument();
      expect(container.querySelector('.badgeFree')).toBeInTheDocument();
    });
  });

  describe('Tenancy Filtering', () => {
    test('filters features by shared tenancy model', () => {
      render(<FeatureTable tenancy="shared" />);

      // All 3 test features support shared
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
    });

    test('filters features by private tenancy model', () => {
      render(<FeatureTable tenancy="private" />);

      // Only test-feature-oss and test-feature-no-url support private
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();

      // test-feature-enterprise does NOT support private
      expect(screen.queryByText('Test Enterprise Feature')).not.toBeInTheDocument();
    });

    test('filters features by standalone tenancy model', () => {
      render(<FeatureTable tenancy="standalone" />);

      // Only test-feature-oss supports standalone
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();

      // Others don't support standalone
      expect(screen.queryByText('Test Enterprise Feature')).not.toBeInTheDocument();
      expect(screen.queryByText('Feature Without URL')).not.toBeInTheDocument();
    });

    test('displays dynamic heading for tenancy filter', () => {
      render(<FeatureTable tenancy="private" />);
      expect(screen.getByText('Features available for Private Nodes')).toBeInTheDocument();
    });

    test('displays default heading without tenancy filter', () => {
      render(<FeatureTable names="test-feature-oss" />);
      expect(screen.getByText('Feature availability')).toBeInTheDocument();
    });

    test('combines names and tenancy filters', () => {
      render(<FeatureTable names="test-feature-oss,test-feature-enterprise" tenancy="shared" />);

      // Both features support shared
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Test Enterprise Feature')).toBeInTheDocument();

      // Feature not in names list should not appear
      expect(screen.queryByText('Feature Without URL')).not.toBeInTheDocument();
    });

    test('combines names and tenancy filters with exclusion', () => {
      render(<FeatureTable names="test-feature-oss,test-feature-enterprise" tenancy="private" />);

      // test-feature-oss supports private
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();

      // test-feature-enterprise does NOT support private
      expect(screen.queryByText('Test Enterprise Feature')).not.toBeInTheDocument();
    });

    test('shows all features when names="all" and tenancy filter applied', () => {
      render(<FeatureTable names="all" tenancy="private" />);

      // Should show only features supporting private (2 features)
      expect(screen.getByText('Test OSS Feature')).toBeInTheDocument();
      expect(screen.getByText('Feature Without URL')).toBeInTheDocument();
      expect(screen.queryByText('Test Enterprise Feature')).not.toBeInTheDocument();
    });

    test('returns null when no features match tenancy filter', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { container } = render(<FeatureTable names="test-feature-enterprise" tenancy="standalone" />);

      // test-feature-enterprise doesn't support standalone
      expect(container.firstChild).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No features found for tenancy model "standalone"')
      );

      warnSpy.mockRestore();
    });

    test('handles invalid tenancy model gracefully', () => {
      const { container } = render(<FeatureTable tenancy="invalid-model" />);

      // No features match invalid tenancy
      expect(container.firstChild).toBeNull();
    });

    test('maintains alphabetical sorting with tenancy filter', () => {
      const { container } = render(<FeatureTable tenancy="private" />);

      const rows = container.querySelectorAll('tbody tr');

      // Should have 2 rows (test-feature-oss and test-feature-no-url)
      expect(rows.length).toBe(2);

      // Verify alphabetical order
      expect(rows[0].querySelector('.featureName').textContent).toBe('Feature Without URL');
      expect(rows[1].querySelector('.featureName').textContent).toBe('Test OSS Feature');
    });
  });

});
