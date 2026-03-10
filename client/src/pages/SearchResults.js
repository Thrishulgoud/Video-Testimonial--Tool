import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Chip,
  Stack
} from '@mui/material';
import VideoCard from '../components/VideoCard';
import { videos } from '../utils/api';

const categories = [
  'All',
  'Education',
  'Entertainment',
  'Gaming',
  'Music',
  'Tech',
  'Sports',
  'Other'
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialSort = searchParams.get('sort') || 'recent';
  const initialPage = parseInt(searchParams.get('page')) || 1;

  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await videos.getVideos({
        search: initialSearch,
        category: category === 'All' ? '' : category,
        sort,
        page
      });
      setVideos(response.data.videos);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [initialSearch, category, sort, page]);

  const updateSearchParams = (params) => {
    const newSearchParams = new URLSearchParams(location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    navigate(`/search?${newSearchParams.toString()}`);
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    updateSearchParams({ category: newCategory, page: 1 });
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSort(newSort);
    setPage(1);
    updateSearchParams({ sort: newSort, page: 1 });
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    updateSearchParams({ page: newPage });
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        {initialSearch ? `Search results for "${initialSearch}"` : 'Browse Videos'}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => handleCategoryChange(cat)}
                color={category === cat ? 'primary' : 'default'}
                variant={category === cat ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={sort} onChange={handleSortChange}>
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : videos.length === 0 ? (
        <Typography>No videos found</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                <VideoCard video={video} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SearchResults;