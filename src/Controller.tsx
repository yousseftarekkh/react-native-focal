import React, { useRef, useCallback } from 'react'

import { View, ViewProps } from 'react-native'
import uniqueId from 'lodash.uniqueid'
import set from 'lodash.set'
import focuses, { blur } from './ref'
import isFunction from 'lodash.isfunction'
import {
  TapGestureHandler,
  HandlerStateChangeEvent
} from 'react-native-gesture-handler'

type TControllerProps<C> = {
  /**
   * Prop responsible to categorize the controlled component as a focusable one or not. Focusable component as `TextInput`, non focusable component as `Button`.
   */
  isFocusable?: boolean
  /**
   * Prop responsible for a customized handling of the `onBlur` action, expects a `boolean` as a return. `true` to remove the focus, `false` to keep in focus.
   */
  onBlur?: (node: C) => boolean
  /**
   * Prop responsible for a customized handling of the `onFocus` action.
   */
  onFocus?: (node?: C) => void
}

type TProps<C> = ViewProps &
  TControllerProps<C> & {
    children: any
  }

const _onBlur = (node: any) => {
  node?.blur?.()
  return true
}

function Controller<C>({
  children,
  isFocusable = true,
  onBlur = _onBlur,
  onFocus,
  ...props
}: TProps<C>) {
  const childRef = useRef<typeof children>(null)
  const { current: privateId } = useRef(uniqueId('ctrlr#'))

  const refSetter = useCallback(
    (node: any) => {
      set(childRef, 'current', node)
      set(focuses, ['current', privateId], {
        node,
        onBlur
      })
    },
    [onBlur]
  )

  const onPress = useCallback(
    (_: HandlerStateChangeEvent<Record<string, unknown>>) => {
      childRef?.current?.focus?.()
      if (isFocusable) set(focuses, ['current', 'focused'], privateId)
      else blur()
      if (isFunction(onFocus)) onFocus()
    },
    [isFocusable, onFocus]
  )

  return (
    <TapGestureHandler onActivated={onPress}>
      <View {...props}>
        {React.cloneElement(children as any, { ref: refSetter })}
      </View>
    </TapGestureHandler>
  )
}

export default Controller
