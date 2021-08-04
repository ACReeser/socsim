import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { HexPoint } from "../../simulation/Geography"

export interface ISelectedSlice{
    selectedCityKey: number|undefined;
    selectedHexKey: string|undefined;
    selectedBeanKey: number|undefined;
    selectedBuildingKey: number|undefined;
}
export const selectedSlice = createSlice({
    name: 'selected',
    initialState: {
        selectedHexKey: undefined,
        selectedCityKey: undefined,
        selectedBeanKey: undefined
    } as ISelectedSlice,
    reducers: {
      doSelectCity: (state, action: PayloadAction<{cityKey: number}>) => {
        return {
            selectedHexKey: undefined,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: undefined
        }
      },
      doSelectHex: (state, action: PayloadAction<{cityKey: number, hex: HexPoint}>) => {
        return {
            selectedHexKey: `${action.payload.hex.q},${action.payload.hex.r}`,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: undefined
        }
      },
      doSelectBuilding: (state, action: PayloadAction<{cityKey: number, buildingKey: number}>) => {
        return {
            selectedHexKey: undefined,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: action.payload.buildingKey
        }
      },
      doSelectBean: (state, action: PayloadAction<{cityKey: number, beanKey: number}>) => {
        return {
            selectedHexKey: undefined,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: action.payload.beanKey,
            selectedBuildingKey: undefined
        }
      },
      doSelectNone: (state) => {
        return {
            selectedBeanKey: undefined, 
            selectedCityKey: undefined,
            selectedHexKey: undefined,
            selectedBuildingKey: undefined
        }
      },
    }
  })
  
  export const { doSelectHex, doSelectNone, doSelectBean, doSelectCity, doSelectBuilding  } = selectedSlice.actions;