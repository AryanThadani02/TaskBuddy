import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define a type for the user state
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: null, // Allow null or a valid User object
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
