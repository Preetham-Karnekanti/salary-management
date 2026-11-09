import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import EmployeeFilters from './EmployeeFilters';

describe('EmployeeFilters', () => {
  let clock: ReturnType<typeof sinon.useFakeTimers>;

  const renderEmployeeFilters = (onApply: sinon.SinonSpy) => {
    return render(<EmployeeFilters countries={[]} departments={[]} onApply={onApply} />);
  };

  beforeEach(() => {
    clock = sinon.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    });
  });

  afterEach(() => {
    cleanup();
    clock.restore();
  });

  it('should apply search after 400ms debounce', async () => {
    const onApply = sinon.spy();

    renderEmployeeFilters(onApply);

    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, {
      target: { value: 'John' },
    });

    await act(async () => {
      await clock.tickAsync(399);
    });

    expect(onApply.called).to.equal(false);

    await act(async () => {
      await clock.tickAsync(1);
    });

    expect(onApply.calledOnce).to.equal(true);
    expect(onApply.firstCall.args[0]).to.deep.equal({
      searchTerm: 'John',
    });
  });

  it('should cancel the previous debounce when search changes', async () => {
    const onApply = sinon.spy();

    renderEmployeeFilters(onApply);

    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, {
      target: { value: 'John' },
    });

    await act(async () => {
      await clock.tickAsync(200);
    });

    fireEvent.change(searchInput, {
      target: { value: 'John Doe' },
    });

    await act(async () => {
      await clock.tickAsync(399);
    });

    expect(onApply.called).to.equal(false);

    await act(async () => {
      await clock.tickAsync(1);
    });

    expect(onApply.calledOnce).to.equal(true);
    expect(onApply.firstCall.args[0]).to.deep.equal({
      searchTerm: 'John Doe',
    });
  });

  it('should apply search immediately when Apply is clicked', async () => {
    const onApply = sinon.spy();

    renderEmployeeFilters(onApply);

    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, {
      target: { value: 'John' },
    });

    const applyButton = screen.getByRole('button', {
      name: /apply/i,
    });

    fireEvent.click(applyButton);

    expect(onApply.calledOnce).to.equal(true);

    expect(onApply.firstCall.args[0]).to.deep.equal({
      searchTerm: 'John',
    });

    await act(async () => {
      await clock.tickAsync(400);
    });

    // The pending debounce should have been cancelled.
    expect(onApply.calledOnce).to.equal(true);
  });
});
