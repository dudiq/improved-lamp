import { Button } from '@pv/ui-kit/button'
import { observer } from 'mobx-react-lite'
import { useCategoriesContext } from '@pv/modules/categories/interface/use-categories-context'
import { ButtonWrapper, Item } from './controls-styles'

export const Controls = observer(() => {
  const { categoriesAction, categoriesStore } = useCategoriesContext()
  const isChildCategory = !categoriesStore.selectedCategory?.catId
  const isSelectedCategory = !!categoriesStore.selectedCategoryId
  const plusButtonVariant = isSelectedCategory ? 'primary' : 'secondary'

  return (
    <ButtonWrapper>
      <Item>
        {isSelectedCategory && (
          <Button
            shape="circle"
            iconName="trash"
            iconSize="huge"
            onClick={categoriesAction.handleRemoveCategory}
          />
        )}
      </Item>
      <Item>
        {isSelectedCategory && (
          <Button
            shape="circle"
            iconName="edit-l"
            iconSize="huge"
            onClick={categoriesAction.handleEditCategory}
          />
        )}
      </Item>
      <Item>
        {isChildCategory && (
          <Button
            shape="circle"
            iconName="plus"
            iconSize="huge"
            variant={plusButtonVariant}
            onClick={categoriesAction.handleAddCategory}
          />
        )}
      </Item>
    </ButtonWrapper>
  )
})
