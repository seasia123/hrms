import { View, FlatList, Text, ActivityIndicator, RefreshControl, Image, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import NotFound from '../../components/NotFound';
import { useRouter } from 'expo-router';
import usePagination from '../../hooks/usePagination';
import moment from 'moment';

const fetchUrl = "/getNotifications";
const perPage = 15;

const NotificationScreen = () => {
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const {
        data,
        refreshing,
        loadingMore,
        handleRefresh,
        loadMore,
        initialLoader,
    } = usePagination(fetchUrl, perPage, 'notifications', 'total');

    const formatDate = (date) => {
        const notificationDate = moment(date);
        const today = moment().startOf('day');
        const yesterday = moment().subtract(1, 'days').startOf('day');

        if (notificationDate.isSame(today, 'd')) {
            return `Today, ${notificationDate.format('h:mm A')}`;
        } else if (notificationDate.isSame(yesterday, 'd')) {
            return `Yesterday, ${notificationDate.format('h:mm A')}`;
        } else {
            return notificationDate.format('MMM D, h:mm A');
        }
    };

    const renderItem = ({ item }) => (
        <Pressable className="flex-row px-5 py-4 border-b border-gray-200 dark:border-gray-700" onPress={() => router.push(`/notification-details/${item.NotificationId}`)}>
            <Image source={require('../../assets/icons/clock.png')} resizeMode='contain' className="w-[40px] h-[40px] mr-3" />
            <View className="flex-shrink">
                <Text className="text-base dark:text-gray-100" numberOfLines={2} ellipsizeMode="tail">{item.Description}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-100">{formatDate(item.CreatedAt)}</Text>
            </View>
        </Pressable>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return <ActivityIndicator animating size="large" color={colorScheme === 'dark' ? '#fff' : '#0000ff'} />;
    };

    if (initialLoader) {
        return (
            <View className="flex-1 justify-center items-center dark:bg-black">
                <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#0000ff'} />
            </View>
        );
    }

    return (
        <View className="dark:bg-black h-full">
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={(item) => item.NotificationId}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#0000ff']}
                    />
                }
                ListFooterComponent={renderFooter}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={<NotFound />}
            />
        </View>
    );
};

export default NotificationScreen;
