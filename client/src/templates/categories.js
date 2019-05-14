import React from "react"
import { Link } from "gatsby"
import { FaHome, FaTags } from "react-icons/fa"

import Layout from "../components/Layout"
import LinkContainer from "../components/LinkContainer"
import {PrimaryHeading, SubHeading} from "../components/Headings"
import styled from "@emotion/styled"

const Li = styled.li`
  list-style: none;
  padding: 10px;
  color: navy;
  transition: color 200ms ease-in-out, text-shadow 200ms ease-in-out;
  a {
    color: navy;
    text-shadow: 1px 1px transparent;
    transition: color 200ms ease-in-out, text-shadow 200ms ease-in-out;
  }
  a:hover {
    color: rgba(0,0,128,.65);
    text-shadow: 1px 1px #fff;
  }
  &:nth-of-type(even) {
    background: rgba(30,144,255, .5);
  }
  &:nth-of-type(odd) {
    background: rgba(145, 145, 145, .5);
  }
  &:nth-of-type(even):hover {
    background: rgba(30,144,255, 1);
  }
  &:nth-of-type(odd):hover {
    background: rgba(145, 145, 145, 1);
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
  const HomeIcon = FaHome
  const TagsIcon = FaTags
  if (category) {
    return (
      <div>
        <PrimaryHeading>
          {license.length} Businesses{license.length === 1 ? "" : "s"} categorized as {category}
        </PrimaryHeading>
        <ul>
          {license.map(({ govId, trade_name_of_business, business_phone_number }) => {
            return (
              <Li key={govId}>
                <SubHeading>
                  <Link to={`/businesses/${trade_name_of_business.toLowerCase().replace(/\s/g, "-")}`}>{trade_name_of_business}</Link>
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
