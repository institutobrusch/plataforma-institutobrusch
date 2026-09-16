-- Áudio do "Pensamento diário" (daily_thoughts) é salvo na RAIZ do bucket
-- privado `audios` (nome "{data}-{uuid}.ext"), diferente dos áudios de
-- cartografia que ficam em pasta "{user_id}/...". A tabela daily_thoughts é
-- legível por qualquer membro logado, mas o storage não tinha policy para
-- esses arquivos, então o áudio não carregaria para os membros.
--
-- Libera leitura dos arquivos na raiz do bucket `audios` (= pensamento diário)
-- para qualquer usuário autenticado, sem afetar os áudios de cartografia
-- (que estão dentro de pasta e continuam restritos ao dono).
create policy "pensamento audios membros"
on storage.objects for select
to public
using (
  bucket_id = 'audios'
  and coalesce(array_length(storage.foldername(name), 1), 0) = 0
  and auth.uid() is not null
);
