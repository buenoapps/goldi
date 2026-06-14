import { fireEvent, render, screen } from '@testing-library/react-native';

import { PinPad } from '../PinPad';

describe('PinPad', () => {
  it('appends a pressed digit to the value', () => {
    const onChange = jest.fn();
    render(<PinPad value="12" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('3'));
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('does not append beyond the PIN length', () => {
    const onChange = jest.fn();
    render(<PinPad value="1234" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('5'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('deletes the last digit', () => {
    const onChange = jest.fn();
    render(<PinPad value="123" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('delete'));
    expect(onChange).toHaveBeenCalledWith('12');
  });

  it('fires onComplete when the value reaches full length', () => {
    const onComplete = jest.fn();
    render(<PinPad value="1234" onChange={() => {}} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('does not fire onComplete for an incomplete value', () => {
    const onComplete = jest.fn();
    render(<PinPad value="12" onChange={() => {}} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('shows an error message when provided', () => {
    render(<PinPad value="" onChange={() => {}} error="Wrong PIN" />);
    expect(screen.getByText('Wrong PIN')).toBeTruthy();
  });
});
