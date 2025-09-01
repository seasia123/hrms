import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';

const BottomModal = forwardRef(({ children, height }, ref) => {
    const refRBSheet = useRef();

    const openModal = () => {
        refRBSheet.current.open();
    };

    const closeModal = () => {
        refRBSheet.current.close();
    };

    useImperativeHandle(ref, () => ({
        openModal,
        closeModal,
    }));

    return (

        <RBSheet
            ref={refRBSheet}
            height={height || 300}
            // useNativeDriver={true}
            customStyles={{
                wrapper: {
                    // backgroundColor: 'transparent',
                },
                // draggableIcon: {
                //     backgroundColor: '#000',
                // },
            }}
            draggable={true}
            dragOnContent={true}
            customModalProps={{
                animationType: 'slide',
                statusBarTranslucent: true,
            }}
            customAvoidingViewProps={{
                enabled: false,
            }}>
            {children}
        </RBSheet>
    );
});

export default BottomModal;
