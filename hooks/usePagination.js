import React, { useState, useCallback, useEffect } from 'react';
import Http from '../services/httpService';
import * as SecureStore from 'expo-secure-store';

const initialData = {
  data: [],
  totalResult: 0,
  status: true,
  pageNo: 0,
  totalPages: 1,
};

const usePagination = (url, perPage = 20, dataKey = 'items', totalKey = 'total') => {
  const [initialLoader, setInitialLoader] = useState(true);
  const [data, setData] = useState(initialData.data);
  const [totalResult, setTotalResult] = useState(initialData.totalResult);
  const [pageNo, setPageNo] = useState(initialData.pageNo);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchCompleted, setFetchCompleted] = useState(false); // New state to track completion

  if (!url) {
    throw new Error('Fetch URL Cannot be Null.');
  }

  // Function to fetch data for a given page number
  const fetchData = async (page) => {
    try {
      const userId = await SecureStore.getItemAsync('user_id');
      const payload = new FormData();
      payload.append('user_id', userId);
      payload.append('perpage', perPage);
      payload.append('page', page);
      payload.append('markAllRead', 1)
      const response = await Http.post(url, payload);
      const resultOld = await response.json();

      if (resultOld?.data?.total === 0 && resultOld?.data?.notifications?.length === 0) {
        setFetchCompleted(true); // Set fetch completed if totalResult is 0
        setData([]);
        setInitialLoader(false);
        return;
      }

      const result = {
        data: resultOld?.data?.[dataKey],
        totalResult: resultOld?.data?.[totalKey],
        status: true,
        pageNo: page,
        totalPages: Math.ceil(resultOld?.data?.total / perPage) || 10,
      };

      if (result.status) {
        if (page === 0) {
          setData(result.data);
        } else {
          setData((prevData) => [...prevData, ...result.data]);
        }
        setTotalResult(result.totalResult);
        setPageNo(result.pageNo);
        setTotalPages(result.totalPages);
      } else {
        console.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
      setInitialLoader(false);
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData(pageNo);
  }, []);

  // Function to handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(0); // Refreshes the first page (0)
  }, []);

  // Function to handle load more (pagination)
  const loadMore = () => {
    if (!loadingMore && pageNo < totalPages && !fetchCompleted) { // Check fetchCompleted
      setLoadingMore(true);
      const nextPage = pageNo + 1;
      fetchData(nextPage);
    }
  };

  return {
    data,
    totalResult,
    refreshing,
    loadingMore,
    handleRefresh,
    loadMore,
    initialLoader,
  };
};

export default usePagination;
