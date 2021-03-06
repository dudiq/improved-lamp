import { Inject, Service } from '@pv/di'
import { MoneySpendingAdapter } from '@pv/modules/money-spending/infra/money-spending.adapter'
import { MoneySpendingStore } from '@pv/modules/money-spending/interface/stores/money-spending.store'
import { PouchService, PouchStore } from '@pv/modules/pouches'
import { MessageBoxService } from '@pv/modules/message-box'
import { t } from '@pv/interface/services/i18n'
import { ExpenseSelectionStore } from '@pv/modules/money-spending/interface/stores/expense-selection.store'
import { HistoryService } from '@pv/interface/services/history.service'
import { Routes } from '@pv/constants/routes'
import { LIMIT_DEFAULT } from '../constants'

@Service()
export class MoneySpendingService {
  constructor(
    @Inject()
    private messageBoxService: MessageBoxService,
    @Inject()
    private moneySpendingStore: MoneySpendingStore,
    @Inject()
    private moneySpendingAdapter: MoneySpendingAdapter,
    @Inject()
    private expenseSelectionStore: ExpenseSelectionStore,
    @Inject()
    private pouchService: PouchService,
    @Inject()
    private pouchStore: PouchStore,
    @Inject()
    private historyService: HistoryService,
  ) {}

  async initialLoadData() {
    this.moneySpendingStore.setExpenses([])
    this.moneySpendingStore.setOffset(0)

    const [categoriesResult] = await Promise.all([
      this.moneySpendingAdapter.getCategories(),
      this.pouchService.loadPouches(),
    ])

    if (categoriesResult.isErr()) {
      // TODO: add error processing
      return
    }

    this.moneySpendingStore.setCategories(categoriesResult.getValue())
    if (this.moneySpendingStore.categories.length === 0) {
      // open empty settings
      this.historyService.push(Routes.empty)
      return
    }

    await this.loadExpenses(0)
  }

  async reloadExpenses() {
    this.moneySpendingStore.setExpenses([])
    this.moneySpendingStore.setOffset(0)
    await this.loadExpenses(0)
  }

  async loadExpenses(offset: number) {
    const currentPouchId = this.pouchStore.currentPouchId

    const result = await this.moneySpendingAdapter.getExpenses({
      offset,
      pouchId: currentPouchId,
      limit: LIMIT_DEFAULT,
    })

    if (result.isErr()) {
      // TODO: add error
      return
    }

    this.moneySpendingStore.setOffset(offset + LIMIT_DEFAULT)
    const nextExpenses = result.getValue()
    this.moneySpendingStore.addExpenses(nextExpenses)
  }

  async removeExpense(id: string) {
    const isConfirmed = await this.messageBoxService.confirm(t('expense.confirmRemove'))
    if (!isConfirmed) return

    this.moneySpendingStore.setIsLoading(true)
    const result = await this.moneySpendingAdapter.removeExpense(id)
    this.moneySpendingStore.setIsLoading(false)
    if (result.isErr()) {
      //TODO: add error processing
      return
    }

    this.moneySpendingStore.setOffset(this.moneySpendingStore.offset - 1)
    this.moneySpendingStore.removeExpenseById(id)
    this.expenseSelectionStore.setCurrentExpenseView(null)
  }

  async handleApply() {
    this.moneySpendingStore.setIsLoading(true)

    const pouchId = this.pouchStore.currentPouchId
    const catId = this.moneySpendingStore.selectedCategoryId
    const desc = this.expenseSelectionStore.currentDesc

    const newExpenses = this.expenseSelectionStore.getExpenses()
    // console.log('newExpenses', newExpenses)

    for (const cost of newExpenses) {
      await this.moneySpendingAdapter.addExpense({
        pouchId,
        catId,
        cost,
        desc,
      })
      // if (result.isErr()) {
      //   //TODO: add error processing
      //   return
      // }
    }
    this.expenseSelectionStore.dropData()

    await this.reloadExpenses()

    this.historyService.push(Routes.expense)
    // await this.initialLoadData()
    this.moneySpendingStore.setIsLoading(false)
  }
}
