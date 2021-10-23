import React, { useEffect, useState } from 'react';
import { GameStorageInstance } from '../GameStorage';
import { manualSave } from '../state/features/world.reducer';
import { useAppDispatch } from '../state/hooks';
export const AutosaveWidget: React.FC<{}> = (props) => {
    const [isDirty, setDirty] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const dispatch = useAppDispatch();
    const onDirty = (dirty: boolean) => {
        setDirty(dirty);
    }
    const onSaving = () => {
        setSaving(true);
        setTimeout(() => setSaving(false), 500);
    }
    const d = useEffect(() => {
        GameStorageInstance.Dirty.subscribe(onDirty);
        return () => GameStorageInstance.Dirty.unsubscribe(onDirty);
    });
    const s = useEffect(() => {
        GameStorageInstance.Saving.subscribe(onSaving);
        return () => GameStorageInstance.Saving.unsubscribe(onSaving);
    });
    return <button disabled={!isDirty || isSaving} onClick={() => {
        dispatch(manualSave());
    }}>
            {
                isSaving ? '💿' : isDirty ? '💾' : '✔️'
            }
        </button>
}