" Project-specific vim macros and mappings. Spent a little while on this. Pretty cool
" Works with this two-liner in vimrc, searches directory tree for '.macros.vim' file :
"
" let vim_macros = system('x=`pwd`; found=1; while [ "$x" != "/" -a $((found)) == 1 ] ; do find "$x" -maxdepth 1 -name .macros.vim -print -quit | grep .; found=$?; x=`dirname "$x"`; done')
" execute ":source ".vim_macros

" Key combo '@ 1' will run 'npm run test'
nnoremap @1 :tabnew<cr>:term npm run test<cr>

" And so on...
