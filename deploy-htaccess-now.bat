@echo off
REM Quick non-interactive deployment of fixed .htaccess

echo Creating deployment script...
echo option batch abort > deploy-htaccess.txt
echo option confirm off >> deploy-htaccess.txt
echo open sftp://u492735793:Ahmed93@93@157.173.209.161:65002 >> deploy-htaccess.txt
echo cd domains/greenofig.com/public_html >> deploy-htaccess.txt
echo put dist\.htaccess .htaccess >> deploy-htaccess.txt
echo chmod 644 .htaccess >> deploy-htaccess.txt
echo exit >> deploy-htaccess.txt

echo Uploading...
winscp.com /script=deploy-htaccess.txt

del deploy-htaccess.txt

echo Done! The fixed .htaccess is now on the server.
echo Please test: https://greenofig.com
