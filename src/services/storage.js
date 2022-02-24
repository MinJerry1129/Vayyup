import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Use storage hooks which stores and gets the value from asyncstorage
 * 
 * @param {string} key 
 * @param {*} initialValue 
 */
export const useStorage = (key, initialValue) => {
    const [item, setValue] = useState(initialValue);

    async function getStoredItem(key) {
        try {
            const item = await AsyncStorage.getItem(key);
            setValue(item);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getStoredItem(key);
    }, [key]);

    const setItem = async (value) => {
        setValue(value);
        await AsyncStorage.setItem(key, value);
    }

    return [item, setItem];
};