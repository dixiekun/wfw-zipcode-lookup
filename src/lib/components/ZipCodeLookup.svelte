<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchZipCodeData } from '$lib/services/googleSheetService';
  import type { ZipCodeData } from '$lib/types/zipCodeData';
  
  // Using Svelte 5 runes properly
  let zipCode = $state('');
  let searchResults = $state<ZipCodeData[]>([]);
  let error = $state('');
  let loading = $state(false);
  let allData = $state<ZipCodeData[]>([]);
  let dataLoaded = $state(false);
  
  // Pagination
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalPages = $state(0);
  let paginatedResults = $derived(getPaginatedResults());
  
  function getPaginatedResults() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return searchResults.slice(startIndex, endIndex);
  }
  
  function updatePagination() {
    totalPages = Math.ceil(searchResults.length / itemsPerPage);
  }
  
  onMount(async () => {
    try {
      loading = true;
      allData = await fetchZipCodeData();
      dataLoaded = true;
      // Initially show all data
      searchResults = [...allData];
      updatePagination();
    } catch (err) {
      error = 'Failed to load zipcode data';
      console.error(err);
    } finally {
      loading = false;
    }
  });
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
  
  function handleSearch() {
    if (!dataLoaded) {
      error = 'Data is still loading, please try again in a moment';
      return;
    }
    
    error = '';
    
    if (!zipCode.trim()) {
      // If search is empty, show all results
      searchResults = [...allData];
    } else {
      const searchTerm = zipCode.trim().toLowerCase();
      
      // Split results into three categories:
      // 1. Exact zip code matches starting with the search term
      // 2. Other fields starting with the search term
      // 3. Other partial matches
      const exactZipStartMatches: ZipCodeData[] = [];
      const otherStartMatches: ZipCodeData[] = [];
      const otherPartialMatches: ZipCodeData[] = [];
      
      allData.forEach(item => {
        // Check if zip code starts with the search term
        if (item.zipCode.toLowerCase().startsWith(searchTerm)) {
          exactZipStartMatches.push(item);
        }
        // Check if other fields start with the search term
        else if (
          item.state.toLowerCase().startsWith(searchTerm) ||
          item.chapter.toLowerCase().startsWith(searchTerm) ||
          item.chapterId.toLowerCase().startsWith(searchTerm) ||
          item.sellerNo.toLowerCase().startsWith(searchTerm)
        ) {
          otherStartMatches.push(item);
        }
        // Check for other partial matches
        else if (
          item.zipCode.toLowerCase().includes(searchTerm) ||
          item.state.toLowerCase().includes(searchTerm) ||
          item.chapter.toLowerCase().includes(searchTerm) ||
          item.chapterId.toLowerCase().includes(searchTerm) ||
          item.sellerNo.toLowerCase().includes(searchTerm)
        ) {
          otherPartialMatches.push(item);
        }
      });
      
      // Combine the results in priority order
      searchResults = [
        ...exactZipStartMatches,
        ...otherStartMatches,
        ...otherPartialMatches
      ];
    }
    
    if (searchResults.length === 0) {
      error = `No results found for: ${zipCode}`;
    }
    
    // Reset to first page when search changes
    currentPage = 1;
    updatePagination();
  }
  
  // Handle input changes for real-time search
  function handleInput() {
    handleSearch();
  }
  
  // Handle keydown for Enter key submission
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }
  
  // Change items per page
  function changeItemsPerPage(e: Event) {
    const select = e.target as HTMLSelectElement;
    itemsPerPage = parseInt(select.value);
    currentPage = 1;
    updatePagination();
  }
  
  // Derived values for pagination info
  const startItem = $derived((currentPage - 1) * itemsPerPage + 1);
  const endItem = $derived(Math.min(currentPage * itemsPerPage, searchResults.length));
</script>

<div class="mx-auto p-6 bg-white rounded-lg shadow-lg max-w-[1024px]">
  <h2 class="text-2xl font-bold mb-6 text-gray-800">Zipcode Lookup</h2>
  
  <div class="mb-6">
    <label for="zipcode" class="block text-sm font-medium text-gray-700 mb-2">
      Search by Zip, State, Chapter, Chapter ID, or Seller No
    </label>
    <div class="flex flex-col sm:flex-row gap-2">
      <input
        id="zipcode"
        type="text"
        bind:value={zipCode}
        oninput={handleInput}
        onkeydown={handleKeydown}
        placeholder="Start typing to search..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
      <button
        onclick={handleSearch}
        class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Search'}
      </button>
    </div>
  </div>
  
  {#if error}
    <div class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded mb-6 shadow-sm">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {error}
      </div>
    </div>
  {/if}
  
  {#if loading && !dataLoaded}
    <div class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
      <p class="mt-3 text-gray-600">Loading zipcode data...</p>
    </div>
  {:else if paginatedResults.length > 0}
    <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table class="w-full bg-white">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Zip</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">State</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div class="w-full sm:max-w-[150px] md:max-w-[200px] lg:max-w-none">Chapter</div>
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chapter ID</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Seller No</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each paginatedResults as item}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{item.zipCode}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{item.state}</td>
              <td class="px-4 py-3 text-sm text-gray-600">
                <div class="w-full sm:max-w-[150px] md:max-w-[200px] lg:max-w-none break-words">{item.chapter}</div>
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">{item.chapterId}</td>
              <td class="px-4 py-3 text-sm text-gray-600">{item.sellerNo}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    <!-- Pagination controls -->
    <div class="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <span class="text-sm text-gray-700">
          Showing <span class="font-medium">{startItem}</span> to <span class="font-medium">{endItem}</span> of <span class="font-medium">{searchResults.length}</span> results
        </span>
        <div class="w-full sm:w-auto">
          <select 
            onchange={changeItemsPerPage} 
            class="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full sm:w-auto"
            bind:value={itemsPerPage}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-wrap justify-center gap-1.5 w-full sm:w-auto">
        <button 
          onclick={() => goToPage(1)} 
          disabled={currentPage === 1}
          class="px-3 py-1.5 rounded-md border text-sm transition-colors {currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
        >
          First
        </button>
        <button 
          onclick={() => goToPage(currentPage - 1)} 
          disabled={currentPage === 1}
          class="px-3 py-1.5 rounded-md border text-sm transition-colors {currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
        >
          Prev
        </button>
        
        <!-- Page numbers -->
        {#each Array(Math.min(5, totalPages)) as _, i}
          {#if totalPages <= 5 || (currentPage <= 3 && i < 5) || (currentPage > totalPages - 3 && i >= totalPages - 5) || (i >= currentPage - 3 && i <= currentPage + 1)}
            {@const pageNum = totalPages <= 5 ? i + 1 : 
                              currentPage <= 3 ? i + 1 : 
                              currentPage > totalPages - 3 ? totalPages - 4 + i : 
                              currentPage - 2 + i}
            <button 
              onclick={() => goToPage(pageNum)} 
              class="px-3 py-1.5 rounded-md border text-sm transition-colors {currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
            >
              {pageNum}
            </button>
          {/if}
        {/each}
        
        <button 
          onclick={() => goToPage(currentPage + 1)} 
          disabled={currentPage === totalPages}
          class="px-3 py-1.5 rounded-md border text-sm transition-colors {currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
        >
          Next
        </button>
        <button 
          onclick={() => goToPage(totalPages)} 
          disabled={currentPage === totalPages}
          class="px-3 py-1.5 rounded-md border text-sm transition-colors {currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'border-gray-300 hover:bg-gray-50 text-gray-700'}"
        >
          Last
        </button>
      </div>
    </div>
  {:else if dataLoaded}
    <div class="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-gray-600 mb-2">No results found</p>
      <p class="text-sm text-gray-500">Try adjusting your search criteria</p>
    </div>
  {/if}
</div>