import useCart from '../hooks/useCart'
import useProducts from '../hooks/useProducts'
import { UseProductsContextType } from '../context/ProductsProvider'
import { ReactElement } from 'react'
import Product from './Product'


const ProductList = () => {
  const {dispatch, REDUCER_ACTIONS, cart} = useCart()
  const {products} = useProducts()

  let pageContent: ReactElement | ReactElement[] = <p>Loading...</p>

  if (products?.length) {
    pageContent = products.map( product => {
      //.some() method to check at least one item in the array is true based on the condition
      const inCart: boolean = cart.some( cartItem => cartItem.sku === product.sku)

      return (
        <Product 
          key={product.sku}
          product={product}
          dispatch={dispatch}
          REDUCER_ACTIONS={REDUCER_ACTIONS}
          inCart={inCart}
         />
      )
    })
  }

  const content = (
    <main className="main main--products">
      {pageContent}
    </main>
  )

  return content
}

export default ProductList
