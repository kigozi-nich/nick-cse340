const pool = require("../database")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    return result.rows[0]
  } catch (error) {
    console.error("Error in registerAccount:", error)
    return null
  }
}

/* *****************************
*   Check for existing email
* *************************** */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Get account by email
* *************************** */
async function getAccountByEmail(account_email){
  try {
    console.log("getAccountByEmail - Searching for email:", account_email)
    const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    console.log("getAccountByEmail - Query result:", {
      found: result.rows.length > 0,
      rowCount: result.rows.length,
      accountData: result.rows[0] ? {
        ...result.rows[0],
        account_password: result.rows[0].account_password ? 'exists' : 'missing'
      } : null
    })
    return result.rows[0]
  } catch (error) {
    console.error("Error in getAccountByEmail:", error)
    throw error // Re-throw the error to handle it in the controller
  }
}

/* *****************************
*   Update account
* *************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Update password
* *************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *"
    const data = await pool.query(sql, [account_password, account_id])
    return data.rows[0]
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Create support ticket
* *************************** */
async function createTicket(account_id, ticket_subject, ticket_description) {
  try {
    // Verify the ticket table exists
    const checkTableSql = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ticket'
      );`
    const tableExists = await pool.query(checkTableSql)
    console.log('Ticket table exists?', tableExists.rows[0].exists)

    if (!tableExists.rows[0].exists) {
      return "Ticket table does not exist in database"
    }

    // Verify account exists
    const checkAccountSql = "SELECT account_id FROM account WHERE account_id = $1"
    const accountExists = await pool.query(checkAccountSql, [account_id])
    console.log('Account exists?', accountExists.rowCount > 0)

    if (accountExists.rowCount === 0) {
      return "Account not found"
    }

    console.log('Creating ticket with:', {
      account_id,
      ticket_subject,
      ticket_description
    })
    
    // Try inserting without the enum cast first
    try {
      const sql = `
        INSERT INTO ticket 
        (account_id, ticket_subject, ticket_description, ticket_status) 
        VALUES ($1, $2, $3, 'Open') 
        RETURNING *`
      const data = await pool.query(sql, [account_id, ticket_subject, ticket_description])
      console.log('Ticket created:', data.rows[0])
      return data.rows[0]
    } catch (insertError) {
      console.error('Initial insert failed, trying with enum cast:', insertError)
      
      // If the first attempt failed, try with explicit enum cast
      const sqlWithCast = `
        INSERT INTO ticket 
        (account_id, ticket_subject, ticket_description, ticket_status) 
        VALUES ($1, $2, $3, 'Open'::ticket_status) 
        RETURNING *`
      const data = await pool.query(sqlWithCast, [account_id, ticket_subject, ticket_description])
      console.log('Ticket created with enum cast:', data.rows[0])
      return data.rows[0]
    }
  } catch (error) {
    console.error('Error in createTicket:', {
      error: error.message,
      stack: error.stack,
      detail: error.detail,
      where: error.where,
      code: error.code
    })
    return `Database error: ${error.message}`
  }
}

/* *****************************
*   Get tickets by account ID
* *************************** */
async function getTicketsByAccountId(account_id) {
  try {
    const sql = "SELECT * FROM ticket WHERE account_id = $1 ORDER BY ticket_created_at DESC"
    const data = await pool.query(sql, [account_id])
    return data.rows
  } catch (error) {
    return error.message
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  updatePassword,
  createTicket,
  getTicketsByAccountId,
}
