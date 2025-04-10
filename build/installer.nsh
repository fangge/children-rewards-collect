!macro customHeader
  RequestExecutionLevel user
!macroend

!macro customInstall
  ; 添加额外的安装步骤
  SetRegView 64
  WriteRegStr HKCR ".crc" "" "ChildrenRewards"
  WriteRegStr HKCR "ChildrenRewards" "" "儿童成长记录册应用程序"
  WriteRegStr HKCR "ChildrenRewards\DefaultIcon" "" "$INSTDIR\儿童成长记录册.exe,0"
  WriteRegStr HKCR "ChildrenRewards\shell\open\command" "" '"$INSTDIR\儿童成长记录册.exe" "%1"'
!macroend

!macro customUnInstall
  ; 添加额外的卸载步骤
  SetRegView 64
  DeleteRegKey HKCR "ChildrenRewards"
!macroend