function buildDetailHTML(data) {
  return `
    <div class="vehicle-detail">
      <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model}" />
      <div class="detail-text">
        <h2>${data.inv_make} ${data.inv_model} (${data.inv_year})</h2>
        <p><strong>Price:</strong> $${parseFloat(data.inv_price).toLocaleString()}</p>
        <p><strong>Mileage:</strong> ${parseInt(data.inv_miles).toLocaleString()} miles</p>
        <p><strong>Color:</strong> ${data.inv_color}</p>
        <p><strong>Description:</strong> ${data.inv_description}</p>
      </div>
    </div>
  `;
}

module.exports = { buildDetailHTML };
