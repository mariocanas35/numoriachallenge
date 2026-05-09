import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children text content', () => {
    render(<Button>Empieza gratis</Button>);
    expect(screen.getByRole('button', { name: 'Empieza gratis' })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-numoria-blue');
  });

  it('applies the secondary variant when requested', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-numoria-orange');
  });

  it('applies the destructive variant', () => {
    render(<Button variant="destructive">Borrar</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-numoria-red');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Big</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-14');
  });

  it('applies fullWidth when set', () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('forwards refs to the underlying button element', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('respects the disabled state', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as child component when asChild=true', () => {
    render(
      <Button asChild>
        <a href="/register">Sign up</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
    expect(link).toHaveClass('bg-numoria-blue');
  });

  it('merges custom className with variant classes', () => {
    render(<Button className="my-custom-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('my-custom-class');
    expect(button).toHaveClass('bg-numoria-blue');
  });

  it('has no a11y violations (default)', async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no a11y violations (disabled state)', async () => {
    const { container } = render(<Button disabled>Inactive</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
