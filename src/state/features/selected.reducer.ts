import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { HexPoint } from "../../simulation/Geography"

export interface ISelectedSlice{
    selectedCityKey: number|undefined;
    selectedHexKey: string|undefined;
    selectedBeanKey: number|undefined;
}
export const selectedSlice = createSlice({
    name: 'selected',
    initialState: {
        selectedHexKey: undefined,
        selectedCityKey: undefined,
        selectedBeanKey: undefined
    } as ISelectedSlice,
    reducers: {
      selectHex: (state, action: PayloadAction<{cityKey: number, hex: HexPoint}>) => {
        return {
            selectedHexKey: `${action.payload.hex.q},${action.payload.hex.r}`,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined
        }
      },
      selectBean: (state, action: PayloadAction<{cityKey: number, beanKey: number}>) => {
        return {
            selectedHexKey: undefined,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: action.payload.beanKey
        }
      },
      selectNone: (state) => {
        return {
            selectedBeanKey: undefined, 
            selectedCityKey: undefined,
            selectedHexKey: undefined
        }
      },
    }
  })
  
  export const { selectHex, selectNone, selectBean  } = selectedSlice.actions