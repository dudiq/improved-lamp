import { ExpenseViewEntity } from '@pv/core/entities/expense-view.entity'
import { getMoney } from '@pv/interface/services/i18n'
import { useMoneySpendingContext } from '@pv/modules/money-spending/interface/use-money-spending-context'
import { useEffect, useRef } from 'preact/compat'
import { Dot } from '../../dot'
import {
  Container,
  LeftBlock,
  RightBlock,
  Title,
  SubTitle,
  Money,
  DateTitle,
} from './expense-row-styles'

type Props = {
  expenseView: ExpenseViewEntity
  isSelected: boolean
  isScrollTo?: boolean
}

export function ExpenseRow({ expenseView, isSelected, isScrollTo }: Props) {
  const { expensesViewStore } = useMoneySpendingContext()
  const date = new Date(expenseView.time)
  const now = new Date()
  const isSameYear = now.getFullYear() === date.getFullYear()

  const time = isSameYear
    ? expensesViewStore.dateFormatter.format(date)
    : expensesViewStore.dateYearFormatter.format(date)
  const hours = date.getHours()
  const rawMinutes = date.getMinutes()
  const minutes = rawMinutes < 10 ? `0${rawMinutes}` : rawMinutes
  const isToday = expenseView.time >= expensesViewStore.startTime

  const refEl = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!isScrollTo) return
    if (!refEl.current) return
    refEl.current.scrollIntoView({
      block: 'center',
      inline: 'center',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container data-is-selected={isSelected} ref={refEl}>
      <LeftBlock>
        <Title>
          {expenseView.catParentTitle ? `${expenseView.catParentTitle} / ` : ''}{' '}
          {expenseView.catTitle}
        </Title>
        <SubTitle>{expenseView.desc}</SubTitle>
      </LeftBlock>
      <RightBlock>
        <Money>{getMoney(expenseView.cost)}</Money>
        <DateTitle>
          {time} | {hours}:{minutes}
          {isToday && <Dot />}
        </DateTitle>
      </RightBlock>
    </Container>
  )
}
