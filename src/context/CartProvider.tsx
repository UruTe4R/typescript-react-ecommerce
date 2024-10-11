import { useReducer, useMemo, createContext, ReactElement } from "react"

export type CartItemType = {
  sku: string,
  name: string,
  price: number,
  qty: number,
}

type CartStateType = { cart: CartItemType[] }

const initCartState: CartStateType = { cart: [] }

const REDUCER_ACTION_TYPE = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  QUANTITY: "QUANTITY",
  SUBMIT: "SUBMIT",
}
//lord TS, plz infer the type;;
export type ReducerActionType = typeof REDUCER_ACTION_TYPE//maybe cuz its literal type

export type ReducerAction = {
  type: string,
  payload?: CartItemType
}

const reducer = (state: CartStateType, action: ReducerAction): CartStateType => {
  switch (action.type){
    case REDUCER_ACTION_TYPE.ADD: {
      if(!action.payload) {
        throw new Error('Action-payload missing in ADD action')
      }
      //destruction
      const { sku, name, price } = action.payload
      //カートの中に使いしたいアイテムと同じIDのアイテムがあるかを確認
      const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)
      //同じIDのアイテムを見つける。もし見つからなければundefined
      const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku)
      //もし同じIDのアイテムがあったら、そのアイテムのqtyを1増やす
      const qty: number = itemExists ? itemExists.qty + 1 : 1

      return { ...state, cart: [...filteredCart, { sku, name, price, qty}] }
    }
    case REDUCER_ACTION_TYPE.REMOVE: {
      if(!action.payload) {
        throw new Error('Action-payload missing in REMOVE action')
      }
      const { sku } = action.payload

      const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)

      return { ...state, cart: [...filteredCart] }
    }
    case REDUCER_ACTION_TYPE.QUANTITY: {
      if(!action.payload) {
        throw new Error('Action-payload missing in QUANTITY action')
      }

      const { sku, qty } = action.payload
      
      const itemExists: CartItemType | undefined = state.cart.find(item => item.sku === sku)
      if(!itemExists) {
        throw new Error('Item must exist in order to update quantity')
      }

      const updatedItem: CartItemType = { ...itemExists, qty }

      const filteredCart: CartItemType[] = state.cart.filter(item => item.sku !== sku)

      return { ...state, cart: [...filteredCart, updatedItem] }
    }
    case REDUCER_ACTION_TYPE.SUBMIT: {
      return { ...state, cart: [] }
   }
    default: 
      return state

  }
}

const useCartContext = (initCartState: CartStateType) => {
  const [state, dispatch] = useReducer(reducer, initCartState)

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE
  }, [])

  //accumulator is previousValue, so its left side, and current value is cartItem
  //順番に足していく
  const totalItems: number = state.cart.reduce((previousValue, cartItem) => {
    return previousValue + cartItem.qty
  }, 0)
  
  
  /* Intl.NumberFormat is a built-in JavaScript object that enables language-sensitive number formatting. */
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD'})
  const totalPrice: string = formatter.format(
    state.cart.reduce((previousValue, cartItem) => {
      return previousValue + (cartItem.qty * cartItem.price) 
    }, 0)
  )

  /* By default, the sort() method converts the elements to strings and sorts them in ascending order based on the Unicode code points. */
  const cart = state.cart.sort((a, b) => {
    const itemA = Number(a.sku.slice(-4))
    const itemB = Number(b.sku.slice(-4))
    //so if itemA is bigger than itemB, then return a positive number leading to sort it in ascending order, meaning put itemB first
    return itemA - itemB
  })

  return { dispatch, REDUCER_ACTIONS, totalItems, totalPrice, cart }
}

export type UseCartContextType = ReturnType<typeof useCartContext>

const initCartContextState: UseCartContextType = {
  dispatch: () => {},
  REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
  totalItems: 0,
  totalPrice: '',
  cart: [],
}

//starts with capital letter
//createContext with default values
export const CartContext = createContext<UseCartContextType>(initCartContextState)

type ChildrenType = { children?: ReactElement | ReactElement[] }

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
  return (
    <CartContext.Provider value={useCartContext(initCartState)}>
      { children }
    </CartContext.Provider>
  )
}

export default CartContext