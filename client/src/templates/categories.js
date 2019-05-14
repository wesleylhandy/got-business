import React, { useState } from "react"
import { Link, navigate } from "gatsby"
import { FaHome, FaTags } from "react-icons/fa"
import Map from '../components/Map'

import Layout from "../components/Layout"
import LinkContainer from "../components/LinkContainer"
import { PrimaryHeading, SubHeading } from "../components/Headings"
import styled from "@emotion/styled"

const Li = styled.li`
  list-style: none;
  position: relative;
  padding: 10px;
  color: navy;
  transition: color 200ms ease-in-out, text-shadow 200ms ease-in-out;
  a {
    color: navy;
    transition: color 200ms ease-in-out;
  }
  a:hover {
    color: #fff;
  }
  &:nth-of-type(even) {
    background: rgba(30,144,255,.25);
  }
  &:nth-of-type(odd) {
    background: rgba(145, 145, 145,.25);
  }
  &:nth-of-type(even):hover, &:nth-of-type(even).active {
    background: rgba(30,144,255, 1);
  }
  &:nth-of-type(odd):hover, &:nth-of-type(odd).active {
    background: rgba(145, 145, 145, 1);
  }
  &.active {
    color: #fff;
  }
  &:before {
    position: absolute;
    display: block;
    top: 50%;
    left: 0;
    transform: translateX(-50px) translateY(-50%);
    text-align: right;
    width:40px;
    color: navy;
    content: "${props=>props.index}"; 
  }
`

const TagList = styled.ul`
  display: flex;
  flex-direction: row;
  justify-content: left;
  align-items: center;
  flex-wrap: wrap;
  margin: 30px -10px;
  padding-left: 1.45rem;
  li {
    box-sizing: border-box;
    display: inline;
    margin: 10px;
    flex: 0 0 auto;
    border-radius: 20px;
    padding: 0;
    font-weight: 700;
    transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
    a {
      padding: 14px;
      display: block;
      width: 100%;
      text-decoration:none;
    }
    a:hover {
      text-shadow: none;
      color: #fff;
    }
  }
  li:hover {
    color: #fff;
  }
  li:nth-of-type(even):hover {
    background: rgba(30,144,255,1);
  }
  li:nth-of-type(odd):hover {
    background: rgba(145, 145, 145, 1);
  }
`

function Categories({ licenses, license, category }) {
  const [active, setActive] = useState(0)
  const HomeIcon = FaHome
  const TagsIcon = FaTags
  if (category) {
    const addMarkers = links => map => {
      links.forEach((link, index) => {
        const { geocoded_column } = link
        if (geocoded_column) {
          const { coordinates } = geocoded_column
          const marker = new window.google.maps.Marker({
            map,
            position: {lat: coordinates[1], lng: coordinates[0]},
            label: `${index + 1}`,
            icon: index + 1 === active ? `https://maps.google.com/mapfiles/kml/paddle/ylw-blank.png` : ``,
            title: link.trade_name_of_business,
          })
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div>
              <div>${link.trade_name_of_business}</div>
              <div>${link.business_mailing_address}, ${link.mailing_city}, ${link.mailing_state}, ${link.mailing_zip_code}</div>
              <div>${link.business_phone_number}</div>
              <div>Owned by ${link.owner_name_of_business}</div>
              <span>Double-Click To View More</span>
            </div>`
          })
          marker.addListener(`dblclick`, () => {
            navigate(`/businesses/${link.trade_name_of_business.toLowerCase().replace(/\s/g, "-")}`, {
              state: { 
                prevPath: window.location.pathname 
              }
            })
          })
          marker.addListener(`click`, ()=> {
            infoWindow.open(map, marker)
            setActive(index + 1)
          })
          marker.addListener(`mouseover`, ()=> {
            infoWindow.open(map, marker)
            setActive(index + 1)
          })
          marker.addListener(`mouseout`, ()=> {
            infoWindow.close()
            setActive(0)
          })
        }
      })
    }
    
    const mapProps = {
      options: {
        center: { lat: 36.7958618, lng: -76.1530532 },
        zoom: 11,
      },
      onMount: addMarkers(license),
    }
    return (
      <div>
        <PrimaryHeading>
          {license.length} Businesses{license.length === 1 ? "" : "s"} categorized as {category}
        </PrimaryHeading>
        <Map {...mapProps}/>
        <ul>
          {license.map(({ govId, trade_name_of_business, business_phone_number }, idx) => {
            return (
              <Li key={govId} index={idx + 1} className={idx + 1 === active ? "active" : "normal"} onMouseOver={e=>setActive(idx+1)}>
                <SubHeading>
                  <Link 
                    to={`/businesses/${trade_name_of_business.toLowerCase().replace(/\s/g, "-")}`}
                    state={{ 
                      prevPath: window.location.pathname 
                    }}
                  >
                    {trade_name_of_business}
                  </Link>
                </SubHeading>
                <p><a href={`tel:${business_phone_number}`}>{business_phone_number}</a></p>
              </Li>
            )
          })}
        </ul>
        <LinkContainer>
          <Link to="/categories">
            <TagsIcon /> All categories
          </Link>
        </LinkContainer>
        <LinkContainer>
          <Link to="/businesses/">
            <HomeIcon /> All Businesses
          </Link>
        </LinkContainer>
      </div>
    )
  }
  return (
    <div>
      <PrimaryHeading>Categories</PrimaryHeading>
      <TagList>
        {Object.keys(licenses).map(categoryName => (
          <Li key={categoryName}>
            <Link to={`/categories/${categoryName.toLowerCase().replace(/\s/g, "-")}`}>{categoryName}</Link>
          </Li>
        ))}
      </TagList>
      <LinkContainer>
        <Link to="/businesses/">
          <HomeIcon /> All Businesses
        </Link>
      </LinkContainer>
    </div>
  )
}

export default function CategoryTemplate(props) {
  const { pageContext } = props
  return (
    <Layout {...props}>
      <Categories {...pageContext} />
    </Layout>
  )
}
