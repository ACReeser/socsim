import React from "react";
import { IBean } from "../simulation/Agent";
import { BeanGetFace, BeanGetSpeech } from "../simulation/Bean";
import { doSelectBean } from "../state/features/selected.reducer";
import { useAppDispatch, useAppSelector } from "../state/hooks";
import { RootState } from "../state/state";
import { GoodIcon } from "../World";

interface AnimatedBeanP {
  cityKey: number;
  beanKey: number;
  sitStill?: boolean;
  static?: boolean;
}

function BeanIsBuying(bean: IBean){
  return bean.actionData.act == 'buy' && bean.actionData.good != 'shelter';
}

export const selectBeanAnimation = (state: RootState, beanKey: number) => {
  const bean = state.world.beans.byID[beanKey];
  const working = bean.actionData.act === 'work';
  return {
    speech: BeanGetSpeech(bean),
    face: BeanGetFace(bean),
    good: BeanIsBuying(bean) ? GoodIcon[bean.actionData.good || 'food'] : undefined,
    classes: [bean.job, bean.ethnicity, bean.actionData.act != 'travel' || !bean.alive ? 'paused' : '', ].join(' '),
    animationClasses: ['bean-walker', working ? 'spin' : '', ].join(' ')
  }
}

export const AnimatedBean: React.FC<AnimatedBeanP> = (props) => {
  const state = useAppSelector(st => selectBeanAnimation(st, props.beanKey));
  const isSelected = useAppSelector(st => st.selected.selectedBeanKey === props.beanKey);
  const classes = ['bean interactable', state.classes, props.sitStill ? '' : state.animationClasses, isSelected ? 'selected' : ''].join(' ');

  const dispatch = useAppDispatch();
  return (
    <span className={classes}
      onClick={(e) => {e.stopPropagation(); dispatch(doSelectBean({cityKey: props.cityKey, beanKey: props.beanKey})) }}
    >
      {state.face} {state.good ? <span className="purchase">
        <span className="money">💸</span>
        <span className="purchase-good">{state.good}</span>
      </span>: null} {state.speech ? <span className="speech">
        <span className="">{state.speech}</span>
      </span>: null}
    </span>
  )
}