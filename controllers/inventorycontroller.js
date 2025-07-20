const inventoryModel = require('../models/inventoryModel');
const utilities = require('../utilities');
const validator = require('validator');
const { getVehicleById } = require('../models/inventoryModel');
const { renderVehicleDetailHTML } = require('../utilities');

// Management view
exports.managementView = (req, res) => {
  res.render('inventory/management', { title: 'Inventory Management', message: req.flash('message') });
};

// Add Classification view (GET)
exports.addClassificationView = (req, res) => {
  res.render('inventory/add-classification', { 
    message: req.flash('message'),
    classification_name: '',
    title: 'Add Classification'
  });
};

// Add Classification (POST)
exports.addClassification = async (req, res) => {
  let { classification_name } = req.body;
  if (!classification_name || !validator.isAlpha(classification_name)) {
    req.flash('message', 'Invalid classification name. Only alphabetic characters allowed.');
    return res.render('inventory/add-classification', { 
      message: req.flash('message'),
      classification_name,
      title: 'Add Classification'
    });
  }
  try {
    const result = await inventoryModel.insertClassification(classification_name);
    if (result.rowCount === 1) {
      req.flash('message', 'Classification added successfully!');
      res.redirect('/inv');
    } else {
      req.flash('message', 'Failed to add classification.');
      res.render('inventory/add-classification', { 
        message: req.flash('message'), 
        classification_name,
        title: 'Add Classification'
      });
    }
  } catch (err) {
    console.error('DB Insert Error:', err); // <-- Add this line
    req.flash('message', 'Server error.');
    res.render('inventory/add-classification', { 
      message: req.flash('message'), 
      classification_name,
      title: 'Add Classification'
    });
  }
};

// Add Inventory view (GET)
exports.addInventoryView = async (req, res) => {
  const classificationList = await utilities.buildClassificationList();
  res.render('inventory/add-inventory', { 
    message: req.flash('message'), 
    classificationList,
    title: 'Add Vehicle',
    // Sticky fields
    classification_id: '', inv_make: '', inv_model: '', inv_year: '', inv_description: '',
    inv_image: '', inv_thumbnail: '', inv_price: '', inv_miles: '', inv_color: ''
  });
};

// Add Inventory (POST)
exports.addInventory = async (req, res) => {
  let {
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  } = req.body;

  let errors = [];
  if (!classification_id) errors.push('Classification is required.');
  if (!inv_make) errors.push('Make is required.');
  if (!inv_model) errors.push('Model is required.');
  if (!inv_year || !validator.isInt(inv_year, { min: 1900, max: 2099 })) errors.push('Year must be 4 digits.');
  if (!inv_description) errors.push('Description is required.');
  if (!inv_image) errors.push('Image path is required.');
  if (!inv_thumbnail) errors.push('Thumbnail path is required.');
  if (!inv_price || !validator.isFloat(inv_price)) errors.push('Price must be a number.');
  if (!inv_miles || !validator.isInt(inv_miles)) errors.push('Miles must be a number.');
  if (!inv_color) errors.push('Color is required.');

  if (errors.length > 0) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    req.flash('message', errors.join(' '));
    return res.render('inventory/add-inventory', {
      message: req.flash('message'),
      classificationList,
      title: 'Add Vehicle',
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    });
  }

  try {
    const result = await inventoryModel.insertInventory({
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    });
    if (result.rowCount === 1) {
      req.flash('message', 'Vehicle added successfully!');
      res.redirect('/inv');
    } else {
      const classificationList = await utilities.buildClassificationList(classification_id);
      req.flash('message', 'Failed to add vehicle.');
      res.render('inventory/add-inventory', {
        message: req.flash('message'),
        classificationList,
        title: 'Add Vehicle',
        classification_id, inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      });
    }
  } catch (err) {
    console.error('Add Inventory Error:', err); // <-- Add this line
    const classificationList = await utilities.buildClassificationList(classification_id);
    req.flash('message', 'Server error.');
    res.render('inventory/add-inventory', {
      message: req.flash('message'),
      classificationList,
      title: 'Add Vehicle',
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    });
  }
};

// Vehicle detail view (example)
exports.getVehicleDetail = async (req, res, next) => {
  try {
    const invId = parseInt(req.params.inv_id, 10);
    const vehicle = await getVehicleById(invId);
    if (!vehicle) {
      const err = new Error('Vehicle not found');
      err.status = 404;
      throw err;
    }
    
    // Initialize default values for reviews
    let reviews = [];
    let reviewStats = { total_reviews: 0, avg_rating: 0 };
    
    // Try to get reviews if the table exists
    try {
      const reviewModel = require('../models/review-model');
      reviews = await reviewModel.getReviewsByVehicleId(invId);
      reviewStats = await reviewModel.getVehicleReviewStats(invId);
    } catch (reviewError) {
      console.log("Reviews not available - table may not exist yet:", reviewError.message);
      // Continue without reviews - they're optional
    }
    
    const detailHTML = renderVehicleDetailHTML(vehicle);
    res.render('inventory/detail', {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      detailHTML,
      vehicle,
      reviews,
      reviewStats,
    });
  } catch (err) {
    next(err);
  }
};