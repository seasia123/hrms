import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { tw } from 'nativewind';

const Spinner = ({
    cancelable = false,
    color = 'white',
    animation = 'none',
    overlayColor = 'rgba(0, 0, 0, 0.25)',
    size = 'large',
    textContent = '',
    textStyle,
    visible = false,
    indicatorStyle,
    customIndicator,
    children,
    spinnerKey
}) => {
    const [spinnerVisible, setSpinnerVisibility] = useState(visible);

    useEffect(() => {
        setSpinnerVisibility(visible);
    }, [visible]);

    const close = () => {
        setSpinnerVisibility(false);
    };

    const _handleOnRequestClose = () => {
        if (cancelable) {
            close();
        }
    };

    const _renderDefaultContent = () => (
        <View className="flex-1 justify-center items-center">
            <View className="bg-white dark:bg-black-50  px-12 py-2 rounded-md">
                {customIndicator || (
                    <ActivityIndicator
                        color={color}
                        size={size}
                        className={indicatorStyle}
                    />
                )}
                <View className="mt-2">
                    <Text className={`text-${color} {textStyle}`}>{textContent}</Text>
                </View>
            </View>
        </View>
    );

    const _renderSpinner = () => (
        <Modal
            animationType={animation}
            onRequestClose={_handleOnRequestClose}
            supportedOrientations={['landscape', 'portrait']}
            transparent
            visible={spinnerVisible}
            statusBarTranslucent={true}
        >
            <View className={`flex-1 justify-center items-center bg-black/60 bg-[${overlayColor}] px-4`}
                key={spinnerKey || `spinner_${Date.now()}`}
            >
                {children || _renderDefaultContent()}
            </View>
        </Modal>
    );

    return _renderSpinner();
};

export default Spinner;
