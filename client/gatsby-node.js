const path = require("path")
const { createFilePath } = require(`gatsby-source-filesystem`)

const createCategoryPages = (createPage, edges) => {
  const categoryTemplate = path.resolve(`src/templates/categories.js`)
  const licenses = {}

  edges.forEach(({ node }) => {
    if (node.trade_name_of_business) {
      
        if (!licenses[node.trade_name_of_business]) {
          licenses[node.trade_name_of_business] = []
        }
        licenses[node.trade_name_of_business].push(node)

    }
  })

  createPage({
    path: "/categories",
    component: categoryTemplate,
    context: {
      licenses,
    },
  })

  Object.keys(licenses).forEach(tradeName => {
    const license = licenses[tradeName]
    const businessName = tradeName.toLowerCase().replace(/\s/g, "-")
    createPage({
      path: `/categories/${businessName}`,
      component: categoryTemplate,
      context: {
        licenses,
        license,
        category: businessName,
      },
    })
  })
}

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const businessCardTemplate = path.resolve(`src/templates/business-card.js`)
  // const blogPostTemplateAmp = path.resolve(`src/templates/blog-post-amp.js`)
  return graphql(`
    {
      allMongodbLocalbusinessesLicenses(
        sort: { order: ASC, fields: [trade_name_of_business] }
      ) {
        edges {
          node {
            mongodb_id
            trade_name_of_business
            owner_name_of_business
            google_verified
            geocoded_column {
              type
              coordinates
            }
            geocoded_column_address
            geocoded_column_city
            geocoded_column_state
            geocoded_column_zip
            business_mailing_address
            mailing_city
            mailing_zip_code
            mailing_zip_4
            business_phone_number
            business_classification
            discovery_date
            naics
            govId
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const licenses = result.data.allMongodbLocalbusinessesLicenses.edges

    createCategoryPages(createPage, licenses)

    // Create pages for each markdown file.
    licenses.forEach(({ node }, index) => {
      const prev = index === 0 ? null : licenses[index - 1].node
      const next = index === licenses.length - 1 ? null : licenses[index + 1].node
    //   console.log({node})
      createPage({
        path: `/businesses/${node.trade_name_of_business.toLowerCase().replace(/\s/g, "-")}`,
        component: businessCardTemplate,
        context: {
          prev,
          next,
        },
      })
    })

    return licenses
  })
}
