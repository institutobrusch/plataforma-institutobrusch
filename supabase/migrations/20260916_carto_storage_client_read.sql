-- Cliente da Cartografia pode ler os próprios arquivos (áudios das sessões,
-- imagem da carta e materiais). Os buckets audios/cartas/materiais são
-- privados e só tinham policy de leitura para admin, então o createSignedUrl
-- do cliente era negado pelo RLS do storage.
--
-- Arquivos são nomeados "{user_id}/{uuid}.ext" (ver montarNomeArquivo),
-- então o primeiro segmento do path identifica o dono.
create policy "carto arquivos proprios"
on storage.objects for select
to public
using (
  bucket_id in ('audios', 'cartas', 'materiais')
  and (storage.foldername(name))[1] = auth.uid()::text
  and has_product('cartografia')
);
