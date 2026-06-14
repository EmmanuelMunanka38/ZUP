import {
  restaurantsService,
} from '@/services/restaurants.service';
import { uploadService } from '@/services/upload.service';
import { MenuItem, Restaurant } from '@/types';

// Mock the API module
jest.mock('@/services/api', () => {
  const mockAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  return {
    api: mockAxios,
    API_ORIGIN: 'https://zup-backend-dhkw.onrender.com',
    BASE_URL: 'https://zup-backend-dhkw.onrender.com/api',
  };
});

const mockRestaurant: Restaurant = {
  id: 'rest-1',
  name: 'Test Restaurant',
  image: 'https://example.com/image.jpg',
  cuisine: 'Tanzanian',
  rating: 4.5,
  ratingCount: 100,
  deliveryFee: 2500,
  deliveryTime: '30-40 min',
  distance: '2.5 km',
  address: '123 Test St',
  location: { latitude: -6.7924, longitude: 39.2083 },
  isOpen: true,
  openingHours: '08:00',
  closingHours: '22:00',
  categories: ['Mains', 'Drinks'],
  menu: [],
};

const mockMenuItem: MenuItem = {
  id: 'menu-1',
  restaurantId: 'rest-1',
  name: 'Test Item',
  description: 'A test menu item',
  price: 12000,
  image: 'https://example.com/item.jpg',
  category: 'Mains',
  isAvailable: true,
  isPopular: false,
};

const { api } = jest.requireMock('@/services/api');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Menu Management - Create Items', () => {
  test('creates a menu item successfully', async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true, data: mockMenuItem },
    });

    const result = await restaurantsService.createMenuItem('rest-1', {
      name: 'Test Item',
      description: 'A test menu item',
      price: 12000,
      image: 'https://example.com/item.jpg',
      category: 'Mains',
      isAvailable: true,
    });

    expect(api.post).toHaveBeenCalledWith(
      '/restaurants/rest-1/menu',
      expect.objectContaining({
        name: 'Test Item',
        price: 12000,
        category: 'Mains',
      })
    );
    expect(result).toEqual(mockMenuItem);
  });

  test('rejects creation when API returns error', async () => {
    const err = new Error('Name is required');
    api.post.mockRejectedValueOnce(err);

    await expect(
      restaurantsService.createMenuItem('rest-1', {
        name: '',
        price: 0,
        category: '',
      } as any)
    ).rejects.toThrow('Name is required');
  });

  test('creates multiple items sequentially', async () => {
    const items = ['Item A', 'Item B', 'Item C'];
    for (const name of items) {
      api.post.mockResolvedValueOnce({
        data: { success: true, data: { ...mockMenuItem, id: `menu-${name}`, name } },
      });
    }

    const results = await Promise.all(
      items.map((name) =>
        restaurantsService.createMenuItem('rest-1', {
          name,
          price: 10000,
          category: 'Mains',
        })
      )
    );

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe('Item A');
    expect(results[2].name).toBe('Item C');
    expect(api.post).toHaveBeenCalledTimes(3);
  });

  test('handles API error during creation', async () => {
    api.post.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      restaurantsService.createMenuItem('rest-1', {
        name: 'Test',
        price: 10000,
        category: 'Mains',
      })
    ).rejects.toThrow('Network error');
  });
});

describe('Menu Management - Edit Items', () => {
  test('updates a menu item successfully', async () => {
    const updatedItem = { ...mockMenuItem, name: 'Updated Item', price: 15000 };
    api.put.mockResolvedValueOnce({
      data: { success: true, data: updatedItem },
    });

    const result = await restaurantsService.updateMenuItem('menu-1', {
      name: 'Updated Item',
      price: 15000,
    });

    expect(api.put).toHaveBeenCalledWith(
      '/restaurants/menu/menu-1',
      expect.objectContaining({
        name: 'Updated Item',
        price: 15000,
      })
    );
    expect(result.name).toBe('Updated Item');
    expect(result.price).toBe(15000);
  });

  test('updates item availability toggle', async () => {
    api.put.mockResolvedValueOnce({
      data: { success: true, data: { ...mockMenuItem, isAvailable: false } },
    });

    const result = await restaurantsService.updateMenuItem('menu-1', {
      isAvailable: false,
    });

    expect(api.put).toHaveBeenCalledWith(
      '/restaurants/menu/menu-1',
      { isAvailable: false }
    );
    expect(result.isAvailable).toBe(false);
  });

  test('handles API error during update', async () => {
    api.put.mockRejectedValueOnce(new Error('Update failed'));

    await expect(
      restaurantsService.updateMenuItem('menu-1', { name: 'New' })
    ).rejects.toThrow('Update failed');
  });
});

describe('Menu Management - Delete Items', () => {
  test('deletes a menu item successfully', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });

    await restaurantsService.deleteMenuItem('menu-1');

    expect(api.delete).toHaveBeenCalledWith('/restaurants/menu/menu-1');
  });

  test('handles API error during deletion', async () => {
    api.delete.mockRejectedValueOnce(new Error('Delete failed'));

    await expect(
      restaurantsService.deleteMenuItem('menu-1')
    ).rejects.toThrow('Delete failed');
  });

  test('deletes multiple items without error', async () => {
    api.delete.mockResolvedValue({ data: { success: true } });

    await Promise.all([
      restaurantsService.deleteMenuItem('menu-1'),
      restaurantsService.deleteMenuItem('menu-2'),
      restaurantsService.deleteMenuItem('menu-3'),
    ]);

    expect(api.delete).toHaveBeenCalledTimes(3);
  });
});

describe('Menu Management - Read Items', () => {
  test('loads menu for a restaurant', async () => {
    const menu = [
      mockMenuItem,
      { ...mockMenuItem, id: 'menu-2', name: 'Second Item' },
    ];
    api.get.mockResolvedValueOnce({
      data: { success: true, data: menu },
    });

    const result = await restaurantsService.getMenu('rest-1');

    expect(api.get).toHaveBeenCalledWith('/restaurants/rest-1/menu');
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Test Item');
  });

  test('returns empty array when restaurant has no menu', async () => {
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    const result = await restaurantsService.getMenu('rest-1');

    expect(result).toEqual([]);
  });

  test('handles API error during menu load', async () => {
    api.get.mockRejectedValueOnce(new Error('Failed to load'));

    await expect(
      restaurantsService.getMenu('rest-1')
    ).rejects.toThrow('Failed to load');
  });
});

describe('Image Upload', () => {
  const mockFileUri = 'file:///path/to/image.jpg';

  test('uploads an image successfully', async () => {
    api.post.mockResolvedValueOnce({
      data: { data: { url: '/uploads/menu/image123.jpg' } },
    });

    const result = await uploadService.uploadImage(mockFileUri);

    expect(api.post).toHaveBeenCalledWith(
      '/upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    expect(result).toContain('https://zup-backend-dhkw.onrender.com');
    expect(result).toContain('/uploads/menu/image123.jpg');
  });

  test('returns absolute URL for already-absolute URLs', async () => {
    api.post.mockResolvedValueOnce({
      data: { data: { url: 'https://cdn.example.com/image.jpg' } },
    });

    const result = await uploadService.uploadImage(mockFileUri);

    expect(result).toBe('https://cdn.example.com/image.jpg');
  });

  test('handles upload failure', async () => {
    api.post.mockRejectedValueOnce(new Error('Upload failed'));

    await expect(uploadService.uploadImage(mockFileUri)).rejects.toThrow(
      'Upload failed'
    );
  });

  test('handles image with different extensions', async () => {
    const testCases = [
      { uri: 'file:///photo.png', expectedType: 'image/png' },
      { uri: 'file:///photo.webp', expectedType: 'image/webp' },
      { uri: 'file:///photo.jpeg', expectedType: 'image/jpeg' },
      { uri: 'file:///photo', expectedType: 'image/jpeg' },
    ];

    for (const { uri, expectedType } of testCases) {
      api.post.mockResolvedValueOnce({
        data: { data: { url: '/uploads/menu/photo.jpg' } },
      });

      await uploadService.uploadImage(uri);
    }

    expect(api.post).toHaveBeenCalledTimes(4);
  });
});

describe('Data Persistence', () => {
  test('item persists after creation (simulates refresh)', async () => {
    // Simulate creating item
    api.post.mockResolvedValueOnce({
      data: { success: true, data: mockMenuItem },
    });

    const created = await restaurantsService.createMenuItem('rest-1', {
      name: 'Test Item',
      price: 12000,
      category: 'Mains',
    });

    // Simulate page refresh - reload menu
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [created] },
    });

    const menu = await restaurantsService.getMenu('rest-1');

    expect(menu).toHaveLength(1);
    expect(menu[0].id).toBe(created.id);
    expect(menu[0].name).toBe('Test Item');
  });

  test('item deletion persists after refresh', async () => {
    // Setup: create and load menu with item
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [mockMenuItem] },
    });

    const menuBefore = await restaurantsService.getMenu('rest-1');
    expect(menuBefore).toHaveLength(1);

    // Delete item
    api.delete.mockResolvedValueOnce({ data: { success: true } });
    await restaurantsService.deleteMenuItem(mockMenuItem.id);

    // Refresh - menu is now empty
    api.get.mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    const menuAfter = await restaurantsService.getMenu('rest-1');
    expect(menuAfter).toHaveLength(0);
  });
});

describe('Error Scenarios', () => {
  test('handles network timeout', async () => {
    api.post.mockRejectedValueOnce(new Error('timeout of 15000ms exceeded'));

    await expect(
      restaurantsService.createMenuItem('rest-1', {
        name: 'Test',
        price: 10000,
        category: 'Mains',
      })
    ).rejects.toThrow('timeout');
  });

  test('handles 401 unauthorized', async () => {
    const err = new Error('Unauthorized');
    (err as any).response = { status: 401, data: { message: 'Unauthorized' } };
    api.post.mockRejectedValueOnce(err);

    await expect(
      restaurantsService.createMenuItem('rest-1', {
        name: 'Test',
        price: 10000,
        category: 'Mains',
      })
    ).rejects.toThrow('Unauthorized');
  });

  test('handles validation errors from backend', async () => {
    const err = new Error('Validation failed');
    (err as any).response = {
      status: 422,
      data: {
        message: 'Validation failed',
        errors: { price: ['Price must be a positive number'] },
      },
    };
    api.post.mockRejectedValueOnce(err);

    await expect(
      restaurantsService.createMenuItem('rest-1', {
        name: 'Test',
        price: -100,
        category: 'Mains',
      })
    ).rejects.toThrow('Validation failed');
  });
});
