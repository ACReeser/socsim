import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { HexPoint } from "../../simulation/Geography"

export interface ISelectedSlice{
    selectedCityKey: number|undefined;
    selectedBeanKey: number|undefined;
    selectedDistrictKey: number|undefined;
    selectedLotKey: number|undefined;
    selectedBuildingKey: number|undefined;
}
export const selectedSlice = createSlice({
    name: 'selected',
    initialState: {
        selectedCityKey: undefined,
        selectedBeanKey: undefined
    } as ISelectedSlice,
    reducers: {
      doSelectCity: (state, action: PayloadAction<{cityKey: number}>) => {
        return {
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: undefined,
            selectedDistrictKey: undefined,
            selectedLotKey: undefined
        }
      },
      doSelectDistrict: (state, action: PayloadAction<{cityKey: number, district: number}>) => {
        return {
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: undefined,
            selectedDistrictKey: action.payload.district,
            selectedLotKey: undefined
        }
      },
      doSelectBuilding: (state, action: PayloadAction<{cityKey: number, buildingKey: number}>) => {
        return {
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: undefined,
            selectedBuildingKey: action.payload.buildingKey,
            selectedLotKey: undefined,
            selectedDistrictKey: undefined
        }
      },
      doSelectBean: (state, action: PayloadAction<{cityKey: number, beanKey: number}>) => {
        return {
            selectedHexKey: undefined,
            selectedCityKey: action.payload.cityKey,
            selectedBeanKey: action.payload.beanKey,
            selectedBuildingKey: undefined,
            selectedDistrictKey: undefined,
            selectedLotKey: undefined
        }
      },
      doSelectNone: (state) => {
        return {
            selectedBeanKey: undefined, 
            selectedCityKey: undefined,
            selectedHexKey: undefined,
            selectedBuildingKey: undefined,
            selectedDistrictKey: undefined,
            selectedLotKey: undefined
        }
      },
    }
  })
  
  export const { doSelectDistrict, doSelectNone, doSelectBean, doSelectCity, doSelectBuilding  } = selectedSlice.actions;