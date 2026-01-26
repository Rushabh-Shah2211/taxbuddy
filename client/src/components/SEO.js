import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, type = 'website', name = 'Artha by RB', image = '/og-image.jpg', url = 'https://artha.com' }) => {
    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title} | {name}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={name} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};

export default SEO;