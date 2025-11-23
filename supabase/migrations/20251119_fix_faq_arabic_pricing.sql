-- Fix Arabic FAQ pricing from incorrect prices (19.99, 39.99, 79.99) to correct prices (9.99, 19.99, 29.99)

-- Update the FAQ pricing question in Arabic
-- Old: 19.99 دولار شهرياً, 39.99 دولار شهرياً, 79.99 دولار شهرياً
-- New: 9.99 دولار شهرياً, 19.99 دولار شهرياً, 29.99 دولار شهرياً

UPDATE site_content
SET content_ar = jsonb_set(
  content_ar,
  '{faqs}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN elem->>'question' LIKE '%كم تكلفة GreenoFig%' OR elem->>'question' LIKE '%تكلفة%' OR elem->>'answer' LIKE '%19.99 دولار شهرياً%'
        THEN jsonb_set(
          elem,
          '{answer}',
          to_jsonb(
            replace(
              replace(
                replace(
                  elem->>'answer',
                  '19.99 دولار شهرياً مع ميزات متقدمة',
                  '9.99 دولار شهرياً مع ميزات متقدمة'
                ),
                '39.99 دولار شهرياً مع مراسلة أخصائي التغذية',
                '19.99 دولار شهرياً مع مراسلة أخصائي التغذية'
              ),
              '79.99 دولار شهرياً مع استشارات مباشرة وميزات حصرية',
              '29.99 دولار شهرياً مع استشارات مباشرة وميزات حصرية'
            )
          )
        )
        ELSE elem
      END
    )
    FROM jsonb_array_elements(content_ar->'faqs') AS elem
  )
)
WHERE page_key = 'faq_page'
AND content_ar->'faqs' IS NOT NULL;

-- Verification query (run separately to check the update)
-- SELECT content_ar->'faqs' FROM site_content WHERE page_key = 'faq_page';
