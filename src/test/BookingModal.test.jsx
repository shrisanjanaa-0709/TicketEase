
import { describe, it, expect, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import BookingModal from '../components/BookingModal'

afterEach(() => {
  cleanup()
})

describe('TicketEase Booking Modal', () => {
  const event = {
    id: 1,
    title: 'Tech Innovation Summit',
    price: 299,
    emoji: '💻',
  }

  it('displays the event title and ticket total', () => {
    render(
      <BookingModal
        event={event}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    expect(
      screen.getByText('Tech Innovation Summit')
    ).toBeInTheDocument()

    expect(screen.getByText('₹299')).toBeInTheDocument()
  })


it('does not confirm a booking with an invalid email', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()

  render(
    <BookingModal
      event={event}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />
  )

  await user.type(
    screen.getByLabelText(/full name/i),
    'Test User'
  )

  await user.type(
    screen.getByLabelText(/email address/i),
    'invalid-email'
  )

  await user.click(
    screen.getByRole('button', {
      name: /confirm booking/i,
    })
  )

  expect(onConfirm).not.toHaveBeenCalled()
})


it('confirms a booking with valid customer details', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()

  render(
    <BookingModal
      event={event}
      onClose={vi.fn()}
      onConfirm={onConfirm}
    />
  )

  await user.type(
    screen.getByLabelText(/full name/i),
    'Test User'
  )

  await user.type(
    screen.getByLabelText(/email address/i),
    'test@example.com'
  )

  await user.selectOptions(
    screen.getByLabelText(/number of tickets/i),
    '2'
  )

  await user.click(
    screen.getByRole('button', {
      name: /confirm booking/i,
    })
  )

  expect(onConfirm).toHaveBeenCalledWith({
    name: 'Test User',
    email: 'test@example.com',
    quantity: 2,
  })
})


it('updates the total when ticket quantity changes', async () => {
  const user = userEvent.setup()

  render(
    <BookingModal
      event={event}
      onClose={vi.fn()}
      onConfirm={vi.fn()}
    />
  )

  await user.selectOptions(
    screen.getByLabelText(/number of tickets/i),
    '2'
  )

  expect(screen.getByText('₹598')).toBeInTheDocument()
})

})
