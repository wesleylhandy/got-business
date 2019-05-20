import React, { useState, useEffect } from "react"
import { Link, graphql } from "gatsby"
import { FaTags  } from "react-icons/fa"
import Layout from "../components/layout"
import { LinkContainer } from "../components/Containers"
import { PrimaryHeading, SubHeading } from "../components/Headings"
import { CategoryListItem, CategoryAlpaLinks } from "../components/Categories"

function Businesses({ data, pageContext }) {
  const { allSitePage: { edges } } = data;
  const alphaLinks = edges.reduce((arr, {node: { path: pathName }}, idx) => {
    if (/-1$/.test(pathName)) {
      const letter = pathName.replace("/businesses-by-letter/", "").split("-")[0]
      arr.push(<Link key={`link=${idx}`} to={pathName} aria-label={`Link to Businesses starting with ${/[^A-z]/.test(letter) ? "Symbols or Numbers" : "the letter " + letter}`}>{letter}</Link>)
    }
    return arr
  }, [])

  const { businessList } = pageContext
  const TagsIcon = FaTags
  
  const [ active, setActive ] = useState(0)
  const [ isLoading, setLoading ] = useState(false)
  const [ hasMore, setMore ] = useState(true)
  const [ businesses, addBusinesses ] = useState([...businessList.slice(0, 10)])


  const initLoadBusinesses = (cb) => {
    setLoading(true)
    cb(true);
  }

  const loadBusinesses = (loading) => {
    if (loading) {
      const currentLength = businesses.length
      const more = currentLength < businessList.length
      const nextBusinesses = more ? businessList.slice(currentLength, currentLength + 20) : []
      // console.log({currentLength, more, nextBusinesses})
      setMore(true)
      addBusinesses ([...businesses, ...nextBusinesses])
      setLoading(false)
    }
  }

  const is_touch_device = () => {
    const isTouch = (window 
      && (('ontouchstart' in window)
      || (window.DocumentTouch && document instanceof window.DocumentTouch)
      || (navigator.msMaxTouchPoints > 0)));
    // console.log({isTouch})
    return isTouch;
  }

  const handleScroll = () => {
    if ( isLoading || !hasMore ) return;
    if ( window && ( window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight ) ){
      initLoadBusinesses(loadBusinesses);
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault(); 
    handleScroll();
  }
  
  useEffect(() => {
    is_touch_device();
    window && window.addEventListener('touchend', handleTouchEnd)
    window && window.addEventListener('scroll', handleScroll)
    window && window.addEventListener('resize', handleScroll)
    return () => {
      window && window.removeEventListener('touchend', handleTouchEnd)
      window && window.removeEventListener('scroll', handleScroll)
      window && window.removeEventListener('resize', handleScroll)
    };
  }, [businesses, isLoading, hasMore])

  return (
    <div>
      <PrimaryHeading>All Businesses</PrimaryHeading>
      <CategoryAlpaLinks>
        {alphaLinks}
      </CategoryAlpaLinks>
      <ul>
        {
          businesses.map(({node: { govId, trade_name_of_business, business_phone_number }}, idx) => {
            return (
              <CategoryListItem key={govId} index={idx + 1} className={idx + 1 === active ? "active" : "normal"} onMouseOver={e=>setActive(idx+1)}>
                <SubHeading>
                  <Link 
                    to={`/businesses/${trade_name_of_business.toLowerCase().replace(/\s/g, "-").replace(/[?#]/g, "")}`}
                    state={{ 
                      prevPath: typeof window !== `undefined` ? window.location.pathname : ''
                    }}
                  >
                    {trade_name_of_business}
                  </Link>
                </SubHeading>
                <p><a href={`tel:${business_phone_number}`}>{business_phone_number}</a></p>
              </CategoryListItem>
            )
          })
        }
      </ul>
      {
        isLoading &&
          <div>Loading...</div>
      }
      {
        !hasMore &&
          <div>All Businesses Loaded!</div>
      }
      {
        hasMore &&
          <div>Scroll Down to Load More...</div>
      }
      <LinkContainer>
        <Link to="/categories">
          <TagsIcon /> All categories
        </Link>
      </LinkContainer>
    </div>
  )
}

function InfiniteBusinessListTemplate(props) {
  return (
    <Layout {...props}>
      <Businesses {...props}/>
    </Layout>
  )
}

export const pageQuery = graphql`
  query PaginatedListQuery ($regx: String!) {
    allSitePage(filter: {
      path: {
        regex: $regx
      }
    }) {
      edges {
        node {
          path
        }
      }
    }
  }
`

export default InfiniteBusinessListTemplate