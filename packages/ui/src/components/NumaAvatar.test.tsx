import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { NumaAvatar } from './NumaAvatar';

describe('NumaAvatar', () => {
  it('renders with default pose (wave)', () => {
    render(<NumaAvatar />);
    expect(screen.getByRole('img', { name: 'Numa saludando' })).toBeInTheDocument();
  });

  it('renders the think pose with correct label', () => {
    render(<NumaAvatar pose="think" />);
    expect(screen.getByRole('img', { name: 'Numa pensando' })).toBeInTheDocument();
  });

  it('renders the celebrate pose', () => {
    render(<NumaAvatar pose="celebrate" />);
    expect(screen.getByRole('img', { name: 'Numa celebrando' })).toBeInTheDocument();
  });

  it('renders the sad pose with encouraging label', () => {
    render(<NumaAvatar pose="sad" />);
    expect(screen.getByRole('img', { name: 'Numa animándote a seguir' })).toBeInTheDocument();
  });

  it('respects custom aria-label override (i18n use case)', () => {
    render(<NumaAvatar pose="celebrate" aria-label="Numa celebrating your win" />);
    expect(screen.getByRole('img', { name: 'Numa celebrating your win' })).toBeInTheDocument();
  });

  it('applies the requested size class', () => {
    const { container } = render(<NumaAvatar size="2xl" />);
    expect(container.firstChild).toHaveClass('w-40');
    expect(container.firstChild).toHaveClass('h-40');
  });

  it('applies bounce-in animation class when animateIn=true', () => {
    const { container } = render(<NumaAvatar animateIn />);
    expect(container.firstChild).toHaveClass('animate-numa-bounce-in');
  });

  it('does not apply animation class when animateIn is omitted', () => {
    const { container } = render(<NumaAvatar />);
    expect(container.firstChild).not.toHaveClass('animate-numa-bounce-in');
  });

  it('merges custom className', () => {
    const { container } = render(<NumaAvatar className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has no a11y violations across all poses', async () => {
    for (const pose of ['wave', 'think', 'celebrate', 'sad'] as const) {
      const { container, unmount } = render(<NumaAvatar pose={pose} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      unmount();
    }
  });
});
