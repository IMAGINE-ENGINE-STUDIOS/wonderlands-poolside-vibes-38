# FLIP helpers

Copyright Imagine Engine Studios Corp.

`previousPage.ts` keeps arrow-only page turning compatible with page-flip's
portrait layout. Bypass its click guard only during the synchronous programmatic
call, never for book pointer events. `flipPublish.ts` handles published editions.
