import { Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'
import Room from '../pages/Room'
import ItemDescription from '../pages/ItemDescription'

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/item_description" element={<ItemDescription />} />
      <Route path="/room/:room" element={<Room />} />
    </Routes>
  )
}

export default Router
