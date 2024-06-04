import { Link, Route } from 'wouter'
import 'vite/modulepreload-polyfill'
// Components
import Home from './components/home'
import ShopifyBlogApi from './components/shopify-blog-api'

function App() {
  return (
    <>
    {/* Links */}
    <div className="flex justify-between p-4 bg-black text-white">
      <div>
        <Link href="/">Home.</Link>
      </div>
      <div>
        <Link className="pr-8" href="/shopify-blog-api">Shopify Blog API.</Link>
      </div>
    </div>
    {/* Routes */}
    <div className="p-4">
      <Route path="/" component={ Home } />
      <Route path="/shopify-blog-api" component={ ShopifyBlogApi } />
    </div>
    </>
  )
}

export default App
