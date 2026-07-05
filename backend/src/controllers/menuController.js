const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items (with optional filters)
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res) => {
  try {
    const filter = {};

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by dietary preference
    if (req.query.isVeg !== undefined) {
      filter.isVeg = req.query.isVeg === 'true';
    }

    // Filter by tag
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // By default, public users only see available items
    // Admin can pass ?showAll=true to see unavailable items too
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin || req.query.showAll !== 'true') {
      filter.isAvailable = true;
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Toggle menu item availability (the key differentiator)
// @route   PATCH /api/menu/:id/toggle
// @access  Admin
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
      message: `${item.name} is now ${item.isAvailable ? 'available' : 'unavailable'}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    res.status(200).json({ success: true, data: {}, message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get tonight's available menu (used in reservation preview)
// @route   GET /api/menu/tonight
// @access  Public
exports.getTonightMenu = async (req, res) => {
  try {
    const hour = new Date().getHours();
    let categories;

    if (hour < 11) {
      categories = ['breakfast'];
    } else if (hour < 15) {
      categories = ['lunch'];
    } else {
      categories = ['dinner', 'desserts', 'drinks'];
    }

    const items = await MenuItem.find({
      isAvailable: true,
      category: { $in: categories }
    }).sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      categories
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
