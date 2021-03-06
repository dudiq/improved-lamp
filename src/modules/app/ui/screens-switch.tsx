import { useCurrentRoute } from '@pv/interface/use-current-route'
import { observer } from 'mobx-react-lite'
import { Swap } from '@pv/ui-kit/swap'
import { NotFoundPage } from '@pv/modules/app/ui/not-found-page'

export const ScreensSwitch = observer(() => {
  const { currentRoute } = useCurrentRoute()

  const ScreenComponent = currentRoute?.component
  const isPageExist = currentRoute && ScreenComponent
  return (
    <>
      <Swap is={!isPageExist} isSlot={<NotFoundPage />}>
        <Swap is={!currentRoute?.route.path} isSlot={<NotFoundPage />}>
          {ScreenComponent && <ScreenComponent />}
        </Swap>
      </Swap>
    </>
  )
})
