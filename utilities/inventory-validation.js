const { body, validationResult } = require("express-validator")
const validate = {}
const utilities = require(".")

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must be string
        body("classification_name")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Please provide a classification name that is at least 3 characters")
        .matches(/^[a-zA-Z\s-]+$/)
        .withMessage("Classification name can only contain letters, spaces, and hyphens")
        .custom(async (classification_name) => {
            const classificationExists = await utilities.checkExistingClassification(classification_name)
            if (classificationExists){
                throw new Error("Classification exists. Please use a different name")
            }
        }),
    ]
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        // Make is required and must be string
        body("inv_make")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a vehicle make")
        .matches(/^[a-zA-Z0-9\s-]+$/)
        .withMessage("Make can only contain letters, numbers, spaces, and hyphens"),

        // Model is required and must be string
        body("inv_model")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a vehicle model")
        .matches(/^[a-zA-Z0-9\s-]+$/)
        .withMessage("Model can only contain letters, numbers, spaces, and hyphens"),

        // Year is required and must be 4 digits
        body("inv_year")
        .trim()
        .isLength({ min: 4, max: 4 })
        .withMessage("Year must be exactly 4 digits")
        .isNumeric()
        .withMessage("Year must contain only numbers")
        .custom(value => {
            const year = parseInt(value)
            const currentYear = new Date().getFullYear()
            if (year < 1900 || year > currentYear + 1) {
                throw new Error(`Year must be between 1900 and ${currentYear + 1}`)
            }
            return true
        }),

        // Description is required
        body("inv_description")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a vehicle description"),

        // Image path is required
        body("inv_image")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide an image path")
        .matches(/^\/images\/.+\.(jpg|jpeg|png|gif)$/i)
        .withMessage("Image path must start with /images/ and end with a valid image extension"),

        // Thumbnail path is required
        body("inv_thumbnail")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a thumbnail path")
        .matches(/^\/images\/.+\.(jpg|jpeg|png|gif)$/i)
        .withMessage("Thumbnail path must start with /images/ and end with a valid image extension"),

        // Price is required and must be numeric
        body("inv_price")
        .trim()
        .isNumeric()
        .withMessage("Price must be a number")
        .custom(value => {
            if (parseFloat(value) <= 0) {
                throw new Error("Price must be greater than zero")
            }
            return true
        }),

        // Miles is required and must be numeric
        body("inv_miles")
        .trim()
        .isNumeric()
        .withMessage("Mileage must be a number")
        .custom(value => {
            if (parseInt(value) < 0) {
                throw new Error("Mileage cannot be negative")
            }
            return true
        }),

        // Color is required
        body("inv_color")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a vehicle color")
        .matches(/^[a-zA-Z\s-]+$/)
        .withMessage("Color can only contain letters, spaces, and hyphens"),

        // Classification is required
        body("classification_id")
        .trim()
        .isNumeric()
        .withMessage("Please select a valid classification")
    ]
}

/* ******************************
* Check data and return errors or continue
* ***************************** */
validate.checkClassData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors: errors.array(),
            title: "Add New Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/* ******************************
* Check inventory data and return errors or continue
* ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
    } = req.body
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors: errors.array(),
            title: "Add New Vehicle",
            nav,
            classificationSelect,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}

module.exports = validate
