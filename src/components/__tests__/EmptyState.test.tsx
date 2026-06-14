import { render, screen } from '@testing-library/react-native';

import { ChildAvatar } from '../ChildAvatar';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('renders title, subtitle and default mascot', () => {
    render(<EmptyState title="No kids yet" subtitle="Add your first child" />);
    expect(screen.getByText('No kids yet')).toBeTruthy();
    expect(screen.getByText('Add your first child')).toBeTruthy();
    expect(screen.getByText('🐹')).toBeTruthy();
  });

  it('omits the subtitle when not provided', () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText('Add your first child')).toBeNull();
  });

  it('supports a custom emoji', () => {
    render(<EmptyState emoji="📜" title="No history" />);
    expect(screen.getByText('📜')).toBeTruthy();
  });
});

describe('ChildAvatar', () => {
  it('renders the chosen emoji', () => {
    render(<ChildAvatar emoji="🦊" color="#F2A93B" />);
    expect(screen.getByText('🦊')).toBeTruthy();
  });
});
