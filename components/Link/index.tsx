/* eslint-disable react/forbid-elements */
import NextLink from 'next/link';
import type { LinkProps as OriginalNextLinkProps } from 'next/link';
import React from 'react';
import type { AnchorHTMLAttributes } from 'react';
import './styles.module.scss';

// `href` is omitted here because NextLinkProps has a more inclusive `href`, accepting URL objects in addition to strings.
type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;
// `passHref` is omitted here because it is not useful enough to be worth implementing.
type NextLinkProps = Omit<OriginalNextLinkProps, 'passHref'>;
// NextLinkProps is `Partial`ed in LinkProps below to make `href` optional in the Link component. NextLinkProps above is not `Partial`ed because `href` is required in NextLink's props.
export type LinkProps = AnchorProps & Partial<NextLinkProps>;

/**
 * Should be used in place of `a`. Accepts any props which `a` accepts.
 * 
 * Also has all props from [Next's `Link` component](https://nextjs.org/docs/api-reference/next/link), except:
 * - `href` is optional. Leaving `href` undefined uses a `button.link` element instead of an `a` element.
 * - `prefetch` defaults to `false`.
 * - `passHref` is removed because it is not useful enough to be worth implementing.
 */
const Link = React.forwardRef((
	{
		// All NextLink-exclusive props.
		as,
		prefetch,
		replace,
		scroll,
		shallow,
		locale,

		// All non-NextLink-exclusive props.
		className,
		href,
		...props
	}: LinkProps,
	ref: React.ForwardedRef<HTMLAnchorElement & HTMLButtonElement>
) => {
	const linkClassName = `link${className ? ` ${className}` : ''}`;
	
	if (href === undefined) {
		return (
			<button
				className={linkClassName}
				{...props as any}
				ref={ref}
			/>
		);
	}
	
	const hrefString = String(href);
	const external = /^(?:(?:[^:/]+:)|\/\/)/.test(hrefString);
	
	const anchorProps: Omit<LinkProps, 'href'> & { href?: string } = {
		...props,
		className: linkClassName,
		// Anchors don't accept URL objects like NextLink's `href` prop does, so in case `href` is a URL object, it should be overwritten with the string version in `anchorProps`.
		href: hrefString
	};
	
	// NextLinks aren't useful for external links, so if the link is external, just return the anchor.
	if (external) {
		// If the link should open in a new tab, add `noreferrer noopener` to its `rel` since you can't trust external targets with [`window.opener`](https://developer.mozilla.org/en-US/docs/Web/API/Window/opener) on older browsers.
		if (anchorProps.target === '_blank') {
			if (anchorProps.rel) {
				if (/(?:^| )(?:noreferrer|noopener)(?:$| )/i.test(anchorProps.rel)) {
					throw new TypeError('If the `target` prop of a Link is `_blank`, its `rel` prop must not include `noreferrer` or `noopener` because they are included automatically.');
				}
				anchorProps.rel += ' noreferrer noopener';
			} else {
				anchorProps.rel = 'noreferrer noopener';
			}
		}
		
		return <a {...anchorProps} ref={ref} />;
	}
	
	// Otherwise, if the link is not external, wrap the anchor in a NextLink to get those [nice features](https://nextjs.org/docs/api-reference/next/link).
	return (
		<NextLink
			href={href}
			as={as}
			prefetch={prefetch ?? false}
			replace={replace}
			scroll={scroll}
			shallow={shallow}
			locale={locale}
		>
			<a {...anchorProps} ref={ref} />
		</NextLink>
	);
});

export default Link;