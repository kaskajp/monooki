import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Joi from 'joi';
import { authMiddleware } from '../utils/auth';
import getDatabase from '../database/connection';
import { generateAndAssignLabelId } from '../utils/labels';
import { AmazonScraper } from '../utils/amazon-scraper';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
    workspace_id: string;
  };
}

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation schema for Amazon URL parsing
const amazonUrlSchema = Joi.object({
  url: Joi.string().uri().required()
});

// Validation schema for item
const itemSchema = Joi.object({
  name: Joi.string().min(1).required(),
  description: Joi.string().allow(''),
  location_id: Joi.alternatives().try(Joi.string().uuid(), Joi.allow(null), Joi.string().allow('')),
  category_id: Joi.alternatives().try(Joi.string().uuid(), Joi.allow(null), Joi.string().allow('')),
  quantity: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().allow(''), Joi.allow(null)),
  model_number: Joi.string().allow(''),
  serial_number: Joi.string().allow(''),
  purchase_date: Joi.string().allow(''),
  purchase_price: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow(''), Joi.allow(null)),
  purchase_location: Joi.string().allow(''),
  warranty: Joi.string().allow(''),
  expiration_date: Joi.string().allow(''),
  custom_fields: Joi.object().allow(null)
});

const updateItemSchema = itemSchema.keys({
  name: Joi.string().min(1) // Make name optional for updates
});

// POST /api/items/parse-amazon-url - Parse Amazon URL and extract product data
router.post('/parse-amazon-url', async (req: any, res: any) => {
  try {
    const { error, value } = amazonUrlSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { url } = value;
    const workspace_id = req.user.workspace_id;
    
    // Clean the Amazon URL to remove tracking parameters
    const cleanUrl = AmazonScraper.cleanAmazonUrl(url);
    
    // Scrape the product data
    const productData = await AmazonScraper.scrapeProduct(cleanUrl);
    
    // Download and save images
    let downloadedImages: Array<{filename: string, original_name: string, mime_type: string, size: number}> = [];
    if (productData.imageUrls && productData.imageUrls.length > 0) {
      try {
        downloadedImages = await AmazonScraper.downloadImages(productData.imageUrls, workspace_id);
      } catch (imageError) {
        console.error('Error downloading images:', imageError);
        // Continue without images if download fails
      }
    }
    
    res.json({
      success: true,
      data: {
        ...productData,
        downloadedImages
      }
    });
    
  } catch (error) {
    console.error('Amazon URL parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to parse Amazon URL';
    res.status(500).json({ 
      success: false, 
      error: errorMessage 
    });
  }
});

// GET /api/items - Get all items with optional search/filter
router.get('/', async (req: any, res: any) => {
  try {
    const { search, category_id, location_id, sort = 'name', order = 'ASC', page = 1, limit = 50 } = req.query;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    let query = `
      SELECT i.*, 
             c.name as category_name, 
             l.name as location_name,
             p.filename as first_photo
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      LEFT JOIN (
        SELECT item_id, filename,
               ROW_NUMBER() OVER (PARTITION BY item_id ORDER BY created_at ASC) as rn
        FROM photos
      ) p ON i.id = p.item_id AND p.rn = 1
      WHERE i.workspace_id = ?
    `;
    
    const params: any[] = [workspace_id];

    // Add search filter
    if (search) {
      query += ` AND (i.name LIKE ? OR i.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Add category filter
    if (category_id) {
      query += ` AND i.category_id = ?`;
      params.push(category_id);
    }

    // Add location filter
    if (location_id) {
      query += ` AND i.location_id = ?`;
      params.push(location_id);
    }

    // Add sorting
    const validSortFields = ['id', 'name', 'purchase_date', 'purchase_price', 'expiration_date', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY i.${sortField} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const items = await db.all(query, params);

    // Parse custom_fields JSON
    const processedItems = items.map(item => ({
      ...item,
      custom_fields: item.custom_fields ? JSON.parse(item.custom_fields) : {}
    }));

    res.json(processedItems);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/items/expiring - Get items expiring within specified days (default 30)
router.get('/expiring', async (req: any, res: any) => {
  try {
    const { days = 30 } = req.query;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Calculate the target date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + parseInt(days));
    const targetDateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const expiringItems = await db.all(`
      SELECT i.*,
             c.name as category_name, 
             l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.workspace_id = ? 
        AND i.expiration_date IS NOT NULL 
        AND i.expiration_date != ''
        AND date(i.expiration_date) <= date(?)
        AND date(i.expiration_date) >= date('now')
      ORDER BY date(i.expiration_date) ASC
    `, [workspace_id, targetDateStr]);

    // Parse custom_fields JSON
    const processedItems = expiringItems.map(item => ({
      ...item,
      custom_fields: item.custom_fields ? JSON.parse(item.custom_fields) : {}
    }));

    res.json(processedItems);
  } catch (error) {
    console.error('Get expiring items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/items/:id - Get item by ID  
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    const item = await db.get(`
      SELECT i.*, 
             c.name as category_name, 
             l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.id = ? AND i.workspace_id = ?
    `, [id, workspace_id]);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Parse custom_fields JSON
    item.custom_fields = item.custom_fields ? JSON.parse(item.custom_fields) : {};

    // Get all photos for this item
    const photos = await db.all(`
      SELECT id, filename, original_name, mime_type, size, created_at
      FROM photos 
      WHERE item_id = ?
      ORDER BY created_at ASC
    `, [id]);

    item.photos = photos;

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/items - Create new item
router.post('/', async (req: any, res: any) => {
  try {
    const { error, value } = itemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();
    
    // Convert empty strings to null for optional fields
    const processedValue = {
      ...value,
      location_id: value.location_id && value.location_id !== '' ? value.location_id : null,
      category_id: value.category_id && value.category_id !== '' ? value.category_id : null,
      quantity: value.quantity && value.quantity !== '' ? parseInt(value.quantity) : null,
      purchase_price: value.purchase_price && value.purchase_price !== '' ? parseFloat(value.purchase_price) : null
    };
    
    // Verify location and category belong to workspace if provided
    if (processedValue.location_id) {
      const location = await db.get('SELECT id FROM locations WHERE id = ? AND workspace_id = ?', 
        [processedValue.location_id, workspace_id]);
      if (!location) {
        return res.status(400).json({ error: 'Invalid location' });
      }
    }

    if (processedValue.category_id) {
      const category = await db.get('SELECT id FROM categories WHERE id = ? AND workspace_id = ?', 
        [processedValue.category_id, workspace_id]);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    const id = uuidv4();
    const labelId = await generateAndAssignLabelId(workspace_id);
    const custom_fields_json = processedValue.custom_fields ? JSON.stringify(processedValue.custom_fields) : null;

    await db.run(`
      INSERT INTO items (
        id, label_id, name, description, location_id, category_id, quantity,
        model_number, serial_number, purchase_date, purchase_price,
        purchase_location, warranty, expiration_date, custom_fields, workspace_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, labelId, processedValue.name, processedValue.description, processedValue.location_id, processedValue.category_id,
      processedValue.quantity, processedValue.model_number, processedValue.serial_number, processedValue.purchase_date,
      processedValue.purchase_price, processedValue.purchase_location, processedValue.warranty, processedValue.expiration_date,
      custom_fields_json, workspace_id
    ]);

    // Get the created item with relations
    const createdItem = await db.get(`
      SELECT i.*, 
             c.name as category_name, 
             l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.id = ?
    `, [id]);

    createdItem.custom_fields = createdItem.custom_fields ? JSON.parse(createdItem.custom_fields) : {};

    res.status(201).json(createdItem);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/items/:itemId/add-downloaded-photos - Add downloaded photos to an item
router.post('/:itemId/add-downloaded-photos', async (req: any, res: any) => {
  try {
    const { itemId } = req.params;
    const { photos } = req.body;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Verify item exists and belongs to workspace
    const item = await db.get('SELECT id FROM items WHERE id = ? AND workspace_id = ?', [itemId, workspace_id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (!photos || !Array.isArray(photos)) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    const savedPhotos = [];
    const now = new Date().toISOString();

    for (const photo of photos) {
      const photoId = uuidv4();
      
      await db.run(`
        INSERT INTO photos (id, filename, original_name, mime_type, size, item_id, workspace_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [photoId, photo.filename, photo.original_name, photo.mime_type, photo.size, itemId, workspace_id, now]);

      savedPhotos.push({
        id: photoId,
        filename: photo.filename,
        original_name: photo.original_name,
        mime_type: photo.mime_type,
        size: photo.size,
        created_at: now
      });
    }

    res.status(201).json({ photos: savedPhotos });
  } catch (error) {
    console.error('Error adding downloaded photos:', error);
    res.status(500).json({ error: 'Failed to add photos' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Check if item exists and belongs to workspace
    const existingItem = await db.get('SELECT id FROM items WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Convert empty strings to null for optional fields
    const processedValue = {
      ...value,
      location_id: value.location_id && value.location_id !== '' ? value.location_id : null,
      category_id: value.category_id && value.category_id !== '' ? value.category_id : null,
      quantity: value.quantity && value.quantity !== '' ? parseInt(value.quantity) : null,
      purchase_price: value.purchase_price && value.purchase_price !== '' ? parseFloat(value.purchase_price) : null
    };

    // Verify location and category belong to workspace if provided
    if (processedValue.location_id) {
      const location = await db.get('SELECT id FROM locations WHERE id = ? AND workspace_id = ?', 
        [processedValue.location_id, workspace_id]);
      if (!location) {
        return res.status(400).json({ error: 'Invalid location' });
      }
    }

    if (processedValue.category_id) {
      const category = await db.get('SELECT id FROM categories WHERE id = ? AND workspace_id = ?', 
        [processedValue.category_id, workspace_id]);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category' });
      }
    }

    const custom_fields_json = processedValue.custom_fields ? JSON.stringify(processedValue.custom_fields) : null;

    await db.run(`
      UPDATE items SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        location_id = ?,
        category_id = ?,
        quantity = COALESCE(?, quantity),
        model_number = COALESCE(?, model_number),
        serial_number = COALESCE(?, serial_number),
        purchase_date = COALESCE(?, purchase_date),
        purchase_price = COALESCE(?, purchase_price),
        purchase_location = COALESCE(?, purchase_location),
        warranty = COALESCE(?, warranty),
        expiration_date = COALESCE(?, expiration_date),
        custom_fields = COALESCE(?, custom_fields),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND workspace_id = ?
    `, [
      processedValue.name, processedValue.description, processedValue.location_id, processedValue.category_id,
      processedValue.quantity, processedValue.model_number, processedValue.serial_number, processedValue.purchase_date,
      processedValue.purchase_price, processedValue.purchase_location, processedValue.warranty, processedValue.expiration_date,
      custom_fields_json, id, workspace_id
    ]);

    // Get the updated item with relations
    const updatedItem = await db.get(`
      SELECT i.*, 
             c.name as category_name, 
             l.name as location_name
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.id = ?
    `, [id]);

    updatedItem.custom_fields = updatedItem.custom_fields ? JSON.parse(updatedItem.custom_fields) : {};

    res.json(updatedItem);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const workspace_id = req.user.workspace_id;
    const db = getDatabase();

    // Check if item exists and belongs to workspace
    const existingItem = await db.get('SELECT id FROM items WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    if (!existingItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await db.run('DELETE FROM items WHERE id = ? AND workspace_id = ?', [id, workspace_id]);
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 