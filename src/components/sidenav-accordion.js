/** @jsx jsx */
import { jsx, css, ThemeProvider } from 'theme-ui'
import { MDXProvider } from '@mdx-js/react'
import React, { useState } from 'react'
import { Global } from '@emotion/core'
import merge from 'deepmerge'

const Overlay = ({ onClick }) => (
  <React.Fragment>
    <div
      onClick={onClick}
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      }}
    />
    <Global
      styles={css({
        body: {
          overflow: ['hidden', 'hidden', 'auto'],
        },
      })}
    />
  </React.Fragment>
)

const createNestedLinks = (children, depth = 0) => {
  const links = React.Children.toArray(children).reduce((acc, child) => {
    const type = child.props && child.props.mdxType
    if (!child.props || !child.props.children) return acc
    if (type === 'a') return [...acc, child]
    if (depth > 0 && type === 'ul') {
      const last = acc[acc.length - 1]
      acc[acc.length - 1] = React.cloneElement(last, {
        links: createNestedLinks(child.props.children),
      })
      return acc
    }
    return [...acc, ...createNestedLinks(child.props.children, depth + 1)]
  }, [])
  return links
}

const flattenLinks = children =>
  React.Children.toArray(children).reduce((acc, child) => {
    if (child.props && child.props.mdxType === 'a') {
      return [...acc, child]
    }
    if (!child.props || !child.props.children) return acc
    return React.Children.toArray([
      ...acc,
      ...flattenLinks(child.props.children),
    ])
  }, [])

export const Sidenav = React.forwardRef(
  ({ open, styles = {}, components, ...props }, ref) => {
    return (
      <ThemeProvider
        theme={{
          styles: merge(
            {
              ul: {
                listStyle: 'none',
                p: 0,
                m: 0,
                ul: {
                  a: {
                    pl: 4,
                  },
                },
              },
              a: {
                display: 'block',
                px: 2,
                py: 2,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: 1,
                fontWeight: 'bold',
              },
            },
            styles
          ),
        }}>
        {open && <Overlay {...props} />}
        <MDXProvider components={components}>
          <div
            {...props}
            ref={ref}
            sx={{
              position: ['fixed', 'sticky'],
              top: 0,
              left: 0,
              bottom: [0, 'auto'],
              zIndex: 1,
              minWidth: 0,
              width: 256,
              maxHeight: ['100vh', 'none'],
              overflowX: 'visible',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              transition: 'transform .2s ease-out',
              transform: [open ? 'translateX(0)' : 'translate(-100%)', 'none'],
              bg: ['background', 'transparent'],
            }}
          />
        </MDXProvider>
      </ThemeProvider>
    )
  }
)

export const AccordionButton = props => {
  const transform = props.open ? 'rotate(-180 8 8)' : 'rotate(0 8 8)'

  return (
    <button
      title="Expand Section"
      {...props}
      sx={{
        appearance: 'none',
        display: 'flex',
        alignItems: 'center',
        p: 2,
        m: 0,
        border: 0,
        borderRadius: 0,
        color: 'inherit',
        bg: 'transparent',
        ':hover,:focus': {
          color: 'primary',
        },
      }}>
      <svg viewBox="0 0 16 16" width="16" height="16">
        <g
          sx={{
            transformOrigin: '8 8',
            transition: 'transform .1s ease-out',
          }}
          transform={transform}>
          <path
            stroke="currentcolor"
            strokeWidth="2"
            fill="none"
            d="M14 6 L8 12 L2 6"
          />
        </g>
      </svg>
    </button>
  )
}

export const AccordionNav = React.forwardRef(
  ({ open, children, components = {}, className, pathname='', ...props }, ref) => {
    const links = createNestedLinks(children)
    const [expanded, setExpanded] = useState({})
    const Link = components.a || 'a'

    const toggle = i => e => {
      e.stopPropagation()
      setExpanded({
        ...expanded,
        [i]: !expanded[i],
      })
    }

    return (
      <div>
        {open && <Overlay {...props} />}
        <div
          ref={ref}
          className={className}
          sx={{
            position: ['fixed', 'fixed', 'sticky'],
            top: 0,
            left: 0,
            bottom: [0, 0, 'auto'],
            zIndex: 1,
            minWidth: 0,
            width: 256,
            maxHeight: ['100vh', '100vh', 'none'],
            overflowX: 'visible',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            transition: 'transform .2s ease-out',
            transform: [open ? 'translateX(0)' : 'translate(-100%)', open ? 'translateX(0)' : 'translate(-100%)', 'none'],
            bg: ['background', 'background', 'transparent'],
          }}>
          <ul
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
            }}>
            {links.map((link, i) => {
              if (link.props.href === pathname ||
                  link.props.links.some((l, j) => l.props.href === pathname)) {
                expanded[i] = true
              }
              return (
                <li key={i}>
                  <div
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}>
                    <Link
                      href={link.props.href}
                      children={link.props.children}
                      className={link.props.className}
                    />
                    {link.props.links && link.props.links.length > 0 && (
                      <AccordionButton
                        open={expanded[i]}
                        sx={{
                          ml: 'auto',
                        }}
                        onClick={toggle(i)}
                      />
                    )}
                  </div>
                  {expanded[i] && (
                    <ul
                      sx={{
                        listStyle: 'none',
                        m: 0,
                        p: 0,
                        pl: 3,
                      }}>
                      {link.props.links.map((l, j) => (
                        <li key={j}>
                          <Link
                            href={l.props.href}
                            children={l.props.children}
                            className={l.props.className}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    )
  }
)

const removeSlash = str => (str.length > 1 ? str.replace(/\/$/, '') : str)

const PaginationLink = ({
  label,
  children,
  mdxType,
  originalType,
  parentName,
  ...props
}) => (
  <a
    {...props}
    sx={{
      fontSize: 1,
      color: 'inherit',
      textDecoration: 'none',
      fontWeight: 'bold',
    }}>
    <div>{label}</div>
    <div
      sx={{
        fontSize: 3,
      }}>
      {children}
    </div>
  </a>
)

export const Pagination = ({ pathname = '', children, ...props }) => {
  const links = flattenLinks(children)
  const index = links.findIndex(
    link => link.props.href === removeSlash(pathname)
  )
  const hasPagination = index > -1
  const previous = links[index - 1]
  const next = links[index + 1]

  return (
    <div
      {...props}
      sx={{
        display: 'flex',
      }}>
      {hasPagination && previous && (
        <PaginationLink {...previous.props} label="Previous:" />
      )}
      <div sx={{ mx: 'auto' }} />
      {hasPagination && next && (
        <PaginationLink {...next.props} label="Next:" />
      )}
    </div>
  )
}
