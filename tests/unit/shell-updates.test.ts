import { describe, expect, it, vi } from 'vitest';
import { observeShellUpdates } from '../../src/shell-updates';

class Worker extends EventTarget {
  constructor(public state: ServiceWorkerState) {
    super();
  }
  transition(state: ServiceWorkerState) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

function harness(initiallyControlled = true) {
  const container = Object.assign(new EventTarget(), {
    controller: initiallyControlled ? new Worker('activated') : null,
  });
  const reload = vi.fn();
  observeShellUpdates(container as unknown as ServiceWorkerContainer, reload);
  const claim = (worker: Worker | null) => {
    container.controller = worker;
    container.dispatchEvent(new Event('controllerchange'));
  };
  return { reload, claim };
}

describe('shell update reload', () => {
  it('waits for the claimed replacement to finish activation, then reloads once', () => {
    const h = harness();
    const replacement = new Worker('activating');
    h.claim(replacement);
    expect(h.reload).not.toHaveBeenCalled();
    replacement.transition('activated');
    expect(h.reload).toHaveBeenCalledOnce();
    replacement.transition('activated');
    h.claim(replacement);
    expect(h.reload).toHaveBeenCalledOnce();
  });

  it('reloads when activation finished before controllerchange', () => {
    const h = harness();
    h.claim(new Worker('activated'));
    expect(h.reload).toHaveBeenCalledOnce();
  });

  it('does not reload for initial installation, but observes the next update', () => {
    const h = harness(false);
    const initial = new Worker('activating');
    h.claim(initial);
    initial.transition('activated');
    expect(h.reload).not.toHaveBeenCalled();
    h.claim(new Worker('activated'));
    expect(h.reload).toHaveBeenCalledOnce();
  });

  it('does not reload for a redundant replacement', () => {
    const h = harness();
    const replacement = new Worker('activating');
    h.claim(replacement);
    replacement.transition('redundant');
    expect(h.reload).not.toHaveBeenCalled();
  });

  it('stops observing a superseded controller', () => {
    const h = harness();
    const old = new Worker('activating');
    const next = new Worker('activating');
    h.claim(old);
    h.claim(next);
    old.transition('activated');
    expect(h.reload).not.toHaveBeenCalled();
    next.transition('activated');
    expect(h.reload).toHaveBeenCalledOnce();
  });
});
