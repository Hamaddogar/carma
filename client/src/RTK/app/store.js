import { configureStore } from '@reduxjs/toolkit';
import { mainReducer } from '../Reducers/Reducers'
export default configureStore({
  reducer: { mainReducer },
});
